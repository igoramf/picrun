#!/bin/bash

# Inicia o emulador Android
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Nome do emulador (listar disponíveis: emulator -list-avds)
AVD_NAME="Medium_Phone_API_36"

echo "Iniciando emulador: $AVD_NAME"
emulator -avd $AVD_NAME -no-snapshot-load &

echo "Aguardando emulador conectar..."
adb wait-for-device

echo "Emulador pronto!"
