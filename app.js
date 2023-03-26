const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, {polling: true});

let customerPhone;
let customerName;

const sendToBase = (phone, name) => {
  console.log(`Data sended ${phone} , ${name}`);
};

const phoneRegex = /^\d{10,12}$/;

const phrases = {
  greetings: 'Привіт, якщо ви хочете зробити замовлення, натисніть кнопку "Зробити замовлення".',
  contactRequest: 'Нам потрібні ваші контактні дані. Отримати з контактних даних телеграм?',
  dataConfirmation: `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`,
  thanksForOrder: `Замовлення успішно оформлено. Дякую ${customerName}`,
  wrongName: 'Невірне ім\'я. Будь ласка, введіть своє справжнє ім\'я:',
  wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
  phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
  nameRequest: 'Введіть своє ім\'я:',
};

const keyboards = {
  startingKeyboard: [['Зробити замовлення']],
  contactRequest: [
    [
      {
        text: 'Так',
        request_contact: true,
      }
    ],
    ['Ні, я введу номер вручну'],
    ['/start'],
  ],
  dataConfirmation: [
    ['Так, Оформити замовлення'],
    ['Ні, повторити введення'],
    ['/start'],
  ],
  enterPhone: [
    ['/start']
  ]
}

bot.onText(/\/start/ , (msg) => {
  customerPhone = undefined;
  customerName = undefined
  bot.sendMessage(msg.chat.id, phrases.greetings, {
    reply_markup: {
      keyboard: keyboards.startingKeyboard,
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (messageText === 'Зробити замовлення') {
    bot.sendMessage(chatId, phrases.contactRequest, {
      reply_markup: {
        keyboard: keyboards.contactRequest,
        resize_keyboard: true,
      },
    });
  } else if (msg.contact) {
    customerPhone = msg.contact.phone_number;
    customerName = msg.contact.first_name;
    console.log(customerPhone)
    bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`, 
      {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
  } else if(messageText === 'Так, Оформити замовлення') {
    sendToBase(customerPhone, customerName);
    bot.sendMessage(chatId, `Замовлення успішно оформлено. Дякую ${customerName}`);
  } else if (messageText === 'Почати спочатку') {
    bot.sendMessage(chatId, '/start');
  } else if(messageText === `Ні, я введу номер вручну` || messageText === 'Ні, повторити введення') {
    customerPhone = undefined;
    customerName = undefined;  
    bot.sendMessage(chatId, phrases.phoneRules, 
      {
        reply_markup: {
          keyboard: keyboards.enterPhone,
          resize_keyboard: true,
        },
      });
  } else if (phoneRegex.test(messageText)) {
    customerPhone = messageText;
    bot.sendMessage(chatId, phrases.nameRequest);
  } else if (customerPhone && customerName == undefined ) {
    if (messageText.length >= 2) {
      customerName = messageText;
      bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?` , {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
    }
  } 
});

