/**
 * APK FORGE - AUTOMATISCHE URL WRAPPER
 * Verandert https://www.google.nl in een Native Android App.
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
      log('Initialiseren van package.json...');
      execSync('npm init -y', { stdio: 'ignore' });
    }

    log('📦 Installeren van Native Bridge (Capacitor)...');
    execSync('npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/status-bar', { stdio: 'inherit' });

    if (!fs.existsSync('www')) {
      fs.mkdirSync('www', { recursive: true });
      fs.writeFileSync(path.join('www', 'index.html'), '<html><head><title>Loading...</title><style>body{background:#000;display:flex;justify-content:center;align-items:center;height:100vh;color:#fff;font-family:sans-serif;}</style></head><body>Verbinding maken met MijnNativeApp...</body></html>');
    }

    log('⚙️ Configureren van de Native Shell...');
    const capConfig = {
      appId: "com.forge.myapp",
      appName: "MijnNativeApp",
      webDir: "www",
      server: {
        url: "https://www.google.nl",
        cleartext: true
      },
      plugins: {
        StatusBar: {
          overlay: true,
          style: "DARK"
        }
      }
    };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capConfig, null, 2));

    if (!fs.existsSync('android')) {
      log('🤖 Android native bestanden genereren...');
      execSync('npx cap add android', { stdio: 'inherit' });
    }

    log('🔄 Instellingen synchroniseren...');
    execSync('npx cap sync android', { stdio: 'inherit' });

    log('🏗️ APK Compileren via Gradle...');
    const androidDir = path.join(process.cwd(), 'android');
    
    if (process.platform !== 'win32') {
      execSync('chmod +x gradlew', { cwd: androidDir });
    }

    const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`${gradleCmd} assembleDebug`, { 
      cwd: androidDir,
      stdio: 'inherit',
      env: { ...process.env, JAVA_HOME: process.env.JAVA_HOME_17_X64 || process.env.JAVA_HOME }
    });

    log('✅ KLAAR! Je APK staat klaar.');

  } catch (err) {
    error('Build mislukt: ' + err.message);
  }
}

startForge();