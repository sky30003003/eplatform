#!/usr/bin/env python3
import secrets
import string
import os
import sys

def generate_secure_string(length=32):
    """Generează un string securizat de lungimea specificată."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_password(length=16):
    """Generează o parolă securizată pentru baza de date."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def update_env_file(env_path, updates):
    """Actualizează fișierul .env cu noile credențiale."""
    if not os.path.exists(env_path):
        print(f"Eroare: Fișierul {env_path} nu există!")
        return False
    
    with open(env_path, 'r') as file:
        lines = file.readlines()
    
    new_lines = []
    for line in lines:
        for key, value in updates.items():
            if line.startswith(key + '='):
                line = f"{key}={value}\n"
                break
        new_lines.append(line)
    
    with open(env_path, 'w') as file:
        file.writelines(new_lines)
    return True

def main():
    # Generare credențiale pentru development
    dev_credentials = {
        'JWT_SECRET': generate_secure_string(),
        'DB_PASSWORD': generate_password()
    }
    
    # Generare credențiale pentru production
    prod_credentials = {
        'JWT_SECRET': generate_secure_string(64),
        'DB_PASSWORD': generate_password(32)
    }
    
    # Actualizare fișiere
    dev_path = 'deployment/config/development/backend.env'
    prod_path = 'deployment/config/production/backend.env'
    
    if update_env_file(dev_path, dev_credentials):
        print("✅ Credențialele pentru development au fost actualizate")
    
    if update_env_file(prod_path, prod_credentials):
        print("✅ Credențialele pentru production au fost actualizate")
    
    print("\n⚠️  IMPORTANT: Salvați aceste credențiale într-un loc sigur!")
    print("\nCredențiale Development:")
    for key, value in dev_credentials.items():
        print(f"{key}: {value}")
    
    print("\nCredențiale Production:")
    for key, value in prod_credentials.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main() 