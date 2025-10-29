cd /tmp

sudo apt update
sudo apt install -y wget gnupg unzip

# Adoptium repo (Temurin JDK 21)
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmour -o /usr/share/keyrings/adoptium.gpg
echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update
sudo apt install -y temurin-21-jdk

# Configura JAVA_HOME corretamente (não deve apontar para o binário 'java', mas sim para o diretório base)
JAVA_PATH=$(readlink -f $(which java))
JAVA_HOME=$(dirname $(dirname "$JAVA_PATH"))
echo "export JAVA_HOME=$JAVA_HOME" >> $HOME/.profile
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> $HOME/.profile
source $HOME/.profile

# Cria pasta e baixa Ghidra
mkdir -p /tmp/ghidra_install
cd /tmp/ghidra_install

wget https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_11.4.2_build/ghidra_11.4.2_PUBLIC_20250826.zip
unzip ghidra_11.4.2_PUBLIC_20250826.zip

# (opcional) mover para /opt
sudo mv ghidra_11.4.2_PUBLIC /opt/ghidra
sudo ln -sf /opt/ghidra/ghidraRun /usr/local/bin/ghidra

echo "✅ Ghidra instalado! Executa com: ghidra"

