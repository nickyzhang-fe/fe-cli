#!/usr/bin/env node
import { Command } from 'commander';
import download from 'download-git-repo';
import { rimraf } from 'rimraf'
import path from 'path'
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora'
import fs from 'fs';
import figlet from 'figlet'

const program = new Command()
const log = console.log
let dir = '' // 文件路径
 const promptList = [{
    type: "confirm",
    message: "欢迎使用东方财富前端脚手架",
    name: "dfcf",
},{
    type: 'rawlist',
    message: '请选择一种项目模板:',
    name: 'template',
    choices: [
        {
            name: "Vue3项目模版",
            value: {
                url: "direct:https://github.com/nickyzhang-fe/fe-template",
                gitName: "Vue3项目模版",
                val: "Vue3-single"
            }
        },{
            name: "monorepo项目模版",
            value: {
                url: "direct:https://github.com/nickyzhang-fe/fe-template",
                gitName: "monorepo项目模版",
                val: "Vue3-monorepo"
            }
        },{
            name: "monorepo子项目",
            value: {
                url: "direct:https://github.com/nickyzhang-fe/fe-template",
                gitName: "monorepo子项目",
                val: "monorepo-single"
            }
        }
    ]
}];
  
program.name('fe-cli')
    .description('前端脚手架')
    .version('1.0.0', '-v, --version')

program.command('create <project_name>')
    .description('创建项目')
    .option('-t, --type <type>', '创建什么类型的项目')
    .action(async (project_name, option) => {
        log(chalk.green('项目名称', project_name))
        dir = path.join(process.cwd(), project_name); 
        const res = await checkDir(dir)
        if (!res.isExists) {// 如果拒绝
            return log(chalk.red('创建项目失败'))
        }
        rimraf.sync(dir, {})
        const { template } = await cliConfig()
        const { url, gitName } = template
        downloadRepo(url, gitName)
    })

/**
 * 检测文件是否存在
 */
const checkDir = async (realPath) => {
    try {
        const res = await fs.existsSync(realPath)
        if (!res) {
            fs.mkdirSync(realPath)
            return { isExists: true }
        }
        return await forceCreateFile()
    } catch (e) {
        log(chalk.red('创建项目失败'))
    }
}
/**
 * 判断是否强制创建项目
 */
const forceCreateFile = () => {
    return inquirer.prompt([{
        type: "confirm",
        message: "当前项目已存在，是否继续创建",
        name: "isExists",
    }])
}
/**
 * cli配置项
 */
const cliConfig = () => {
    return inquirer.prompt(promptList)
}
/**
 * 仓库下载
 * @param {*} url 
 * @param {*} project_template 
 */
const downloadRepo = (url, project_template) => {
    const spinner = ora(`正在下载 ${chalk.green(project_template)}`).start();
    download(url,
        dir,
        {
            clone: true
        },
        async function(err) {
            if (err) {
                spinner.fail(`${chalk.red('模板下载失败！')}`)
            } else {
                log(chalk.blue("\r\n" +
                    figlet.textSync("fe-cli", {
                    font: "Ghost",
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 80,
                    whitespaceBreak: true,
                })));
                spinner.succeed(`${chalk.green('模板下载成功！')}`)
            }
        })
}
program.parse(process.argv)
