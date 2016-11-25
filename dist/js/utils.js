'use strict';

var utils = {
  isWeChat: () => (/micromessenger/i).test(navigator.userAgent),
  isMobile: (phone) => /^(1)\d{10}$/.test(phone),
  isEmail: (mail) => /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/.test(mail),
  trim: (text) => text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''),
  fullTwo: (num) => num > 9 ? num : '0' + num,
  ele: (ele, all) => all ? document.querySelectorAll(ele) : document.querySelector(ele),
  setDocTitle: (title) => {
    document.title = title;
    if(utils.isWeChat()) {
      let iframe = document.createElement('iframe');
      iframe.src = '/favicon.ico';
      iframe.style.visibility = 'hidden';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 0);
      };
      document.body.appendChild(iframe);
    }
  }
}

module.exports = utils;
