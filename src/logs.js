import chalk from "chalk";

export function success(str) {
	console.log(chalk.green.bold(str));
}

export function warn(str) {
	console.log(chalk.yellow.bold(`[WARNING] ${str}`));
}

export function err(str) {
	console.log(chalk.red.bold(`[ERR] ${str}`));
}
