const schedule = require('node-schedule')
const pt = require('../service/pt')

/**
 * 初始化 定时任务
 */
const create = () => {
    console.log("初始化 定时任务")
    schedule.scheduleJob('0 */1 * * * *', pt.polling)
}

module.exports = {
    create
}