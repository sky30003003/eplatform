#!/bin/bash

# Definire culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Praguri de alertă
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=80

# Verificare CPU
cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d% -f1)
echo -e "${YELLOW}Utilizare CPU:${NC} ${cpu_usage}%"
if [ $(echo "$cpu_usage > $CPU_THRESHOLD" | bc) -eq 1 ]; then
    echo -e "${RED}ALERTĂ: Utilizare CPU ridicată!${NC}"
fi

# Verificare memorie
memory_usage=$(vm_stat | awk '/Pages active/ {print $3}' | sed 's/\.//')
total_memory=$(sysctl hw.memsize | awk '{print $2}')
memory_percent=$(echo "scale=2; $memory_usage * 4096 * 100 / $total_memory" | bc)
echo -e "${YELLOW}Utilizare Memorie:${NC} ${memory_percent}%"
if [ $(echo "$memory_percent > $MEMORY_THRESHOLD" | bc) -eq 1 ]; then
    echo -e "${RED}ALERTĂ: Utilizare memorie ridicată!${NC}"
fi

# Verificare spațiu disk
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo -e "${YELLOW}Utilizare Disk:${NC} ${disk_usage}%"
if [ $disk_usage -gt $DISK_THRESHOLD ]; then
    echo -e "${RED}ALERTĂ: Spațiu disk redus!${NC}"
fi

# Verificare procese
echo -e "\n${YELLOW}Top 5 Procese după CPU:${NC}"
ps aux | sort -nr -k 3 | head -5

echo -e "\n${YELLOW}Top 5 Procese după Memorie:${NC}"
ps aux | sort -nr -k 4 | head -5 