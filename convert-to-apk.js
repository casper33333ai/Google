/**
 * APK FORGE - AUTOMATISCHE URL WRAPPER + ICON INJECTOR
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (msg) => console.log(`[32m[FORGE][0m ${msg}`);
const error = (msg) => { console.error(`[31m[FOUT][0m ${msg}`); process.exit(1); };

async function startForge() {
  log('🚀 Starten van de transformatie voor: https://www.google.nl');

  try {
    if (!fs.existsSync('package.json')) {
      execSync('npm init -y', { stdio: 'ignore' });
    }

    log('📦 Installeren van Capacitor & Plugins...');
    execSync('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/status-bar', { stdio: 'inherit' });

    if (!fs.existsSync('www')) {
      fs.mkdirSync('www', { recursive: true });
      fs.writeFileSync(path.join('www', 'index.html'), '<html><body style="background:#000"></body></html>');
    }

    log('⚙️ Configureren van Capacitor...');
    const capConfig = {
      appId: "com.forge.myapp",
      appName: "MijnNativeApp",
      webDir: "www",
      server: { url: "https://www.google.nl", cleartext: true }
    };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capConfig, null, 2));

    if (!fs.existsSync('android')) {
      log('🤖 Android platform toevoegen...');
      execSync('npx cap add android', { stdio: 'inherit' });
    }

    // ICON LOGICA
    if (fs.existsSync('app-icon.png')) {
      log('🎨 Custom icoon gedetecteerd, installeren...');
      const resPath = 'android/app/src/main/res';
      const mipmapFolders = [
        'mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'
      ];

      mipmapFolders.forEach(folder => {
        const targetDir = path.join(resPath, folder);
        if (fs.existsSync(targetDir)) {
          fs.copyFileSync('app-icon.png', path.join(targetDir, 'ic_launcher.png'));
          fs.copyFileSync('app-icon.png', path.join(targetDir, 'ic_launcher_round.png'));
          // Voor nieuwere Android versies ook adaptive icon background vervangen
          if (fs.existsSync(path.join(targetDir, 'ic_launcher_foreground.png'))) {
             fs.copyFileSync('app-icon.png', path.join(targetDir, 'ic_launcher_foreground.png'));
          }
        }
      });
    }

    log('🔄 Synchroniseren...');
    execSync('npx cap sync android', { stdio: 'inherit' });

    log('🏗️ APK Compileren...');
    const androidDir = path.join(process.cwd(), 'android');
    if (process.platform !== 'win32') execSync('chmod +x gradlew', { cwd: androidDir });

    const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`${gradleCmd} assembleDebug`, { 
      cwd: androidDir,
      stdio: 'inherit',
      env: { ...process.env, JAVA_HOME: process.env.JAVA_HOME_17_X64 || process.env.JAVA_HOME }
    });

    log('✅ APK Succesvol gegenereerd!');
  } catch (err) {
    error('Build mislukt: ' + err.message);
  }
}

startForge();