const exec = require('child_process').execSync;
const fs = require('fs');
const rp = require('request-promise');
const download = require('download');

// 公共变量
const KEY = process.env.JD_COOKIE;
const serverJ = process.env.PUSH_KEY;

async function downFile() {
    // const url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
    const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
    await download(url, './');
}

async function changeFiele() {
    let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8');
    content = content.replace(/var Key = ''/, `var Key = '${KEY}'`);
    await fs.writeFileSync('./JD_DailyBonus.js', content, 'utf8');
}

async function sendNotify(title, desp) {
    const options = {
        uri: `https://sctapi.ftqq.com/${serverJ}.send?title=${encodeURI(title)}&desp=${encodeURI(desp)}`,
        method: 'POST',
    };
    await rp
        .post(options)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
}

async function start() {
    if (!KEY) {
        console.log('请填写 key 后在继续');
        return;
    }
    // 下载最新代码
    await downFile();
    console.log('下载代码完毕');
    // 替换变量
    await changeFiele();
    console.log('替换变量完毕');
    // 执行
    await exec('node JD_DailyBonus.js >> result.txt');
    console.log('执行完毕');

    const time = new Intl.DateTimeFormat('zh', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());

    let notify = '';

    if (serverJ) {
        const path = './result.txt';
        if (fs.existsSync(path)) {
            const content = fs.readFileSync(path, 'utf8');
            console.log(content);

            notify =
                time +
                '\n' +
                content
                    .split('\n')
                    .filter((item) => {
                        return /【/.test(item) || /签到用时/.test(item);
                    })
                    .join('\n');
            console.log(notify);
        }
        await sendNotify('京东签到', notify);
        console.log('发送结果完毕');
    }
}

start();
