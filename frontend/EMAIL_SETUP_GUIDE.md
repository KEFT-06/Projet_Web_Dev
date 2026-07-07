# 📧 GUIDE DE CONFIGURATION EMAIL - ZEDUC-SP@CE

**Date:** 31 Octobre 2024  
**Service:** EmailJS (Gratuit)

---

## 🎯 OBJECTIF

Configurer l'envoi d'emails réels pour la réinitialisation de mot de passe via Gmail.

---

## 📋 PRÉREQUIS

- ✅ Un compte Gmail actif
- ✅ Accès à Internet
- ✅ 10 minutes de configuration

---

## 🚀 ÉTAPES DE CONFIGURATION

### 1️⃣ Créer un Compte EmailJS

1. Aller sur **https://www.emailjs.com/**
2. Cliquer sur **"Sign Up"**
3. S'inscrire avec votre email
4. Vérifier votre email et activer le compte

**✅ Compte créé!**

---

### 2️⃣ Ajouter un Service Email (Gmail)

1. Dans le dashboard EmailJS, aller dans **"Email Services"**
2. Cliquer sur **"Add New Service"**
3. Sélectionner **"Gmail"**
4. Cliquer sur **"Connect Account"**
5. Autoriser EmailJS à accéder à votre Gmail
6. **Copier le SERVICE_ID** (ex: `service_abc1234`)

**✅ Service Gmail connecté!**

---

### 3️⃣ Créer un Template d'Email

1. Aller dans **"Email Templates"**
2. Cliquer sur **"Create New Template"**
3. Configurer le template:

#### **Nom du Template**
```
Password Reset - ZEDUC-SP@CE
```

#### **Sujet de l'Email**
```
Réinitialisation de votre mot de passe - ZEDUC-SP@CE
```

#### **Contenu de l'Email** (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .code-box {
      background: #f97316;
      color: white;
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      letter-spacing: 5px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Réinitialisation de Mot de Passe</h1>
      <p>ZEDUC-SP@CE - Mon Miam Miam</p>
    </div>
    
    <div class="content">
      <p>Bonjour <strong>{{to_name}}</strong>,</p>
      
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ZEDUC-SP@CE.</p>
      
      <p>Votre code de réinitialisation est:</p>
      
      <div class="code-box">
        {{reset_code}}
      </div>
      
      <p><strong>⏰ Ce code est valide pendant 15 minutes.</strong></p>
      
      <p>Ou cliquez sur le bouton ci-dessous:</p>
      
      <center>
        <a href="{{reset_link}}" class="button">Réinitialiser mon mot de passe</a>
      </center>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p style="color: #666; font-size: 14px;">
        ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
        Votre mot de passe restera inchangé.
      </p>
      
      <p style="margin-top: 30px;">
        Cordialement,<br>
        <strong>L'équipe ZEDUC-SP@CE</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 ZEDUC-SP@CE - Mon Miam Miam</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
```

4. **Copier le TEMPLATE_ID** (ex: `template_xyz5678`)

**✅ Template créé!**

---

### 4️⃣ Obtenir la Public Key

1. Aller dans **"Account"** > **"General"**
2. Dans la section **"API Keys"**
3. **Copier la "Public Key"** (ex: `abc123XYZ456`)

**✅ Public Key obtenue!**

---

### 5️⃣ Configurer l'Application

1. Ouvrir le fichier:
```
frontend/src/services/EmailService.ts
```

2. Remplacer les valeurs par défaut:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'votre_service_id',    // ← Remplacer ici
  TEMPLATE_ID: 'votre_template_id',  // ← Remplacer ici
  PUBLIC_KEY: 'votre_public_key',    // ← Remplacer ici
};
```

**Exemple:**
```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc1234',
  TEMPLATE_ID: 'template_xyz5678',
  PUBLIC_KEY: 'abc123XYZ456',
};
```

3. Sauvegarder le fichier

**✅ Application configurée!**

---

## 🧪 TESTER L'ENVOI D'EMAIL

### Test 1: Via l'Application

1. Lancer l'application:
```bash
npm run dev
```

2. Aller sur la page **"Mot de passe oublié"**
3. Entrer un email valide (existant dans la base)
4. Cliquer sur **"Envoyer le code"**
5. Vérifier votre boîte Gmail

**✅ Email reçu!**

### Test 2: Via la Console

1. Ouvrir la console du navigateur (F12)
2. Vérifier les logs:
```
✅ EmailJS initialized
✅ Email sent successfully to: user@example.com
```

---

## 📊 LIMITES DU PLAN GRATUIT

| Fonctionnalité | Limite |
|----------------|--------|
| **Emails/mois** | 200 |
| **Emails/jour** | 10 |
| **Services** | 2 |
| **Templates** | Illimité |
| **Support** | Email |

**💡 Parfait pour le développement et petits projets!**

---

## 🔒 SÉCURITÉ

### ✅ Bonnes Pratiques

1. **Ne jamais** commiter les clés dans Git
2. Utiliser des variables d'environnement en production
3. Activer la vérification 2FA sur Gmail
4. Limiter les domaines autorisés dans EmailJS

### 🔐 Variables d'Environnement (Production)

Créer un fichier `.env`:
```env
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz5678
VITE_EMAILJS_PUBLIC_KEY=abc123XYZ456
```

Utiliser dans le code:
```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
```

---

## 🐛 DÉPANNAGE

### Problème: Email non reçu

**Solutions:**
1. ✅ Vérifier le dossier **Spam/Courrier indésirable**
2. ✅ Vérifier que l'email existe dans la base
3. ✅ Vérifier les logs dans la console
4. ✅ Vérifier la limite quotidienne (10 emails/jour)

### Problème: Erreur "Failed to send email"

**Solutions:**
1. ✅ Vérifier que les IDs sont corrects
2. ✅ Vérifier la connexion Internet
3. ✅ Vérifier que le service Gmail est actif
4. ✅ Réinitialiser la connexion Gmail dans EmailJS

### Problème: "EmailJS not configured"

**Solution:**
1. ✅ Remplacer les valeurs par défaut dans `EmailService.ts`
2. ✅ Redémarrer le serveur de développement

---

## 🎯 MODE SIMULATION

Si EmailJS n'est pas configuré, l'application utilise le **mode simulation**:

```
📧 [SIMULATION] Email envoyé à: user@example.com
🔑 [SIMULATION] Code de réinitialisation: ABC123
⏰ [SIMULATION] Valide pendant: 15 minutes
```

Le code est affiché dans la console pour les tests.

---

## 🚀 ALTERNATIVES (Production)

Pour une application en production, considérer:

| Service | Prix | Emails/mois |
|---------|------|-------------|
| **SendGrid** | Gratuit | 100/jour |
| **AWS SES** | $0.10/1000 | Illimité |
| **Mailgun** | Gratuit | 5000/mois |
| **Postmark** | $10/mois | 10000 |

---

## ✅ CHECKLIST FINALE

- [ ] Compte EmailJS créé
- [ ] Service Gmail connecté
- [ ] Template créé avec le bon contenu
- [ ] IDs copiés dans `EmailService.ts`
- [ ] Application testée
- [ ] Email reçu dans Gmail
- [ ] Code de réinitialisation fonctionne

---

## 📞 SUPPORT

### EmailJS
- **Documentation:** https://www.emailjs.com/docs/
- **Support:** support@emailjs.com

### Application
- **Email:** dev@zeduc-space.com
- **Documentation:** Voir `ARCHITECTURE.md`

---

**Configuré par:** Équipe Dev ZEDUC-SP@CE  
**Date:** 31 Octobre 2024  
**Version:** 2.0.0
