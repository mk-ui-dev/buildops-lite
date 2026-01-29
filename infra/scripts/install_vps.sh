#!/bin/bash
set -euo pipefail

# BuildOps Lite VPS Installation Script
# For Ubuntu 22.04/24.04

echo "=== BuildOps Lite VPS Setup ==="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Create buildops user
echo "Creating buildops user..."
if ! id "buildops" &>/dev/null; then
    sudo useradd -m -s /bin/bash buildops
    sudo usermod -aG docker buildops
fi

# Install fail2ban for security
echo "Installing fail2ban..."
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure UFW firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/buildops
sudo chown buildops:buildops /opt/buildops

echo "=== VPS Setup Complete ==="
echo "Next steps:"
echo "1. Clone repository to /opt/buildops"
echo "2. Create .env file with required variables"
echo "3. Run: cd /opt/buildops && make up"
