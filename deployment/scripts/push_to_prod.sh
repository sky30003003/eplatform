#!/bin/bash

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurare
PROD_SERVER="ubuntu@130.162.56.21"
DEPLOY_PATH="/var/www/eplatform/deploy"
BACKUP_PATH="/var/www/eplatform/backups"
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"

# Funcție pentru logging
log() {
    echo -e "${2:-$NC}$1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Funcție pentru verificare status
check_status() {
    if [ $? -eq 0 ]; then
        log "✓ $1" "$GREEN"
        return 0
    else
        log "✗ $1" "$RED"
        return 1
    fi
}

# Funcție pentru a cere confirmare
confirm() {
    read -p "$1 [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Start deployment
log "🚀 Începere deployment..." "$YELLOW"

# Verificare dacă există modificări necommise
log "Verificare modificări locale..." "$YELLOW"
if [[ -n $(git status -s) ]]; then
    log "Există modificări necommise:" "$YELLOW"
    git status -s
    
    if confirm "Vrei să fac commit la aceste modificări?"; then
        # Arată diff-ul
        log "\nModificări ce vor fi commise:" "$YELLOW"
        git diff

        if confirm "Confirmă că vrei să commit aceste modificări"; then
            # Cere mesajul de commit
            read -p "Introdu mesajul de commit: " commit_message
            
            # Dacă nu s-a introdus niciun mesaj, folosește unul default
            if [ -z "$commit_message" ]; then
                commit_message="chore: actualizare automată din scriptul de deployment"
            fi
            
            # Adaugă și face commit la modificări
            git add .
            git commit -m "$commit_message"
            check_status "Commit local"
            
            # Push către remote
            log "Push către repository..." "$YELLOW"
            git push origin main
            if ! check_status "Push către repository"; then
                log "❌ Push eșuat. Verifică conexiunea și permisiunile." "$RED"
                exit 1
            fi
        else
            log "Deployment anulat la cererea utilizatorului." "$YELLOW"
            exit 1
        fi
    else
        log "Deployment anulat. Te rog să gestionezi modificările locale înainte de deployment." "$RED"
        exit 1
    fi
fi
check_status "Verificare git status"

# Creare director pentru backup pe server
log "Creare director backup pe server..." "$YELLOW"
ssh $PROD_SERVER "mkdir -p $BACKUP_PATH"
check_status "Creare director backup"

# Creare backup
log "Creare backup..." "$YELLOW"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
ssh $PROD_SERVER "cd /var/www/eplatform && tar -czf $BACKUP_PATH/$BACKUP_FILE deploy/"
check_status "Backup creat: $BACKUP_FILE"

# Pull și build pe server
log "Deployment pe server..." "$YELLOW"
ssh $PROD_SERVER "cd $DEPLOY_PATH && \
    git pull origin main && \
    npm run install:all && \
    npm run build && \
    cp deployment/config/production/ecosystem.config.js . && \
    pm2 delete all || true && \
    pm2 start ecosystem.config.js && \
    sudo cp deployment/config/production/nginx.conf /etc/nginx/sites-available/eplatform && \
    sudo nginx -t && \
    sudo systemctl reload nginx"
DEPLOY_STATUS=$?

# Verificare status deployment
if [ $DEPLOY_STATUS -eq 0 ]; then
    log "✅ Deployment realizat cu succes!" "$GREEN"
    
    # Verificare servicii
    log "\nStatus servicii:" "$YELLOW"
    ssh $PROD_SERVER "pm2 list && echo -e '\nNginx status:' && systemctl status nginx | grep Active"
    
    # Verificare migrări
    log "\nVerificare migrări..." "$YELLOW"
    ssh $PROD_SERVER "cd $DEPLOY_PATH/backend && npm run migration:run"
    check_status "Migrări verificate"
    
    # URL-uri pentru verificare
    log "\n🌐 Verifică aplicația la următoarele URL-uri:" "$GREEN"
    log "Frontend: https://eplatform.ro" "$GREEN"
    log "Backend: https://eplatform.ro/api" "$GREEN"
    
    # Afișare ultimele log-uri
    log "\n📋 Ultimele log-uri:" "$YELLOW"
    ssh $PROD_SERVER "pm2 logs --lines 10"
else
    log "❌ Deployment eșuat!" "$RED"
    log "Restaurare din backup..." "$YELLOW"
    ssh $PROD_SERVER "cd /var/www/eplatform && tar -xzf $BACKUP_PATH/$BACKUP_FILE"
    check_status "Restaurare din backup"
    exit 1
fi

# Sumar deployment
log "\n📊 Sumar deployment:" "$YELLOW"
log "- Backup creat: $BACKUP_FILE" "$GREEN"
log "- Timestamp: $(date '+%Y-%m-%d %H:%M:%S')" "$GREEN"
log "- Log file: $LOG_FILE" "$GREEN"

# Instrucțiuni pentru rollback
log "\n⚠️ Pentru rollback, rulează:" "$YELLOW"
log "ssh $PROD_SERVER \"cd /var/www/eplatform && tar -xzf $BACKUP_PATH/$BACKUP_FILE\"" "$NC" 