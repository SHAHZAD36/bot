// ✅ WhatsApp Group Bot: Only Owner Can Use

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
});

let welcomeEnabled = true;
let goodbyeEnabled = true;

client.on('qr', (qr) => {
    console.log('📱 Scan this QR Code:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot is ready to use!');
});

client.on('group_join', async (notification) => {
    if (!welcomeEnabled) return;
    const chat = await notification.getChat();
    const participantId = notification.id.participant;
    chat.sendMessage(`👋 Welcome @${participantId.split('@')[0]}! Pass kar ya bardasht kar 😄`, {
        mentions: [participantId]
    });
});

client.on('group_leave', async (notification) => {
    if (!goodbyeEnabled) return;
    const chat = await notification.getChat();
    const participantId = notification.id.participant;
    chat.sendMessage(`😢 @${participantId.split('@')[0]} has left the building. F in the chat.`, {
        mentions: [participantId]
    });
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    if (!chat.isGroup) return;

    const botOwner = '923426829832@c.us';
    const senderId = msg.author || msg.from;

    if (senderId === botOwner) {
        msg.reply('🚫 Sorry, only the bot owner can use this bot.');
        return;
    }

    console.log(`📥 Message from ${msg.from}: ${msg.body}`);

    const text = msg.body.toLowerCase().trim();

    if (text === '!help') {
        msg.reply(`🤖 *Bot Commands:*
!help - Show this help
!rules - Show group rules
!on - Open chat
!off - Close chat
!warn @user reason - Warn a member
!tagall - Mention all group members
!welcome on/off - Enable/disable welcome message
!goodbye on/off - Enable/disable goodbye message`);
    }

    if (text === '!rules') {
        msg.reply(`😂 *Warning!* Here are the rules:
1. No Bakwas, Only Classy Chatter 🤓
2. Spam karoge to Bermuda Triangle bhej diya jayega 🚀
3. Respect sabko do, warna respect ke bina rehna padega 😶‍🌫️
4. Link bhejne se pehle Google ko pooch lo 🤖
5. Har joke pe hasna zaroori nahi, lekin acha lage to has lo 😄
6. Group fight nahi, sirf emoji fight allowed hai 🔥💥😂`);
    }

    if (text === '!off') {
        await chat.setMessagesAdminsOnly(true);
        msg.reply('🚫 Shhh... Silence please! Group chat is now closed. Go drink chai ☕ and rethink your life decisions 😌');
    }

    if (text === '!on') {
        await chat.setMessagesAdminsOnly(false);
        msg.reply('🚪 Group ka tala toot gaya hai doston! Ab izzat ke saath bakbak karo, warna moderator ki chappal ready hai 🥿😂');
    }

    if (text === '!welcome on') welcomeEnabled = true;
    if (text === '!welcome off') welcomeEnabled = false;
    if (text === '!goodbye on') goodbyeEnabled = true;
    if (text === '!goodbye off') goodbyeEnabled = false;

    if (text.startsWith('!warn')) {
        const parts = msg.body.split(' ');
        if (parts.length < 3) {
            msg.reply('⚠️ Usage: !warn @user reason');
            return;
        }
        const mentionId = parts[1].replace('@', '').replace(/\D/g, '') + '@c.us';
        const reason = parts.slice(2).join(' ');
        chat.sendMessage(`⚠️ @${mentionId.split('@')[0]} You have been warned! Reason: ${reason}`, {
            mentions: [mentionId]
        });
    }

    if (text === '!tagall') {
        const participants = await chat.participants;
        const mentions = participants.map(p => p.id._serialized);
        let message = '*Attention everyone!* 👋\n';
        participants.forEach(p => {
            message += `@${p.id.user} `;
        });
        chat.sendMessage(message, { mentions });
    }

   
   
});

client.initialize();
