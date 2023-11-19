import {
	LED_CONSTANTS,
	getLeds,
	setLeds,
	toggleLeds
} from './leds.js';

import {
	GPIO_SYSFS_CONSTANTS,
	getExportedPins,
	isPinExported,
	exportPin,
	unexportPin,
	getPinDirection,
	setPinDirection,
	getPinValue,
	setPinValue
} from './gpio-sysfs.js';

import {
	detectGpio,
	getGpioInfo,
	getPinValues,
	setPinValues,
	togglePinValues
} from './gpio-device.js';

let ledColorIndex = 0;
let forwardDirection = true; 
let timerId;

const ledsFwrdBwrdInf = async () => {
	const colorToValueMap = 
		LED_CONSTANTS.ALL_LED_COLORS
		.reduce((acc, color) => {
			const value = ledColorIndex === LED_CONSTANTS.ALL_LED_COLORS.indexOf(color);
			acc[color] = value;
			return acc;
		}, {});

	await setLeds(colorToValueMap);

	forwardDirection && (ledColorIndex === ALL_LED_COLORS.length - 1) && (forwardDirection = false);
	!forwardDirection && (ledColorIndex === 0) && (forwardDirection = true);
	forwardDirection ? (ledColorIndex++) : (ledColorIndex--);

	timerId = await setTimeout(async () => 
		await ledsFwrdBwrdInf(), 
		150
	);
};

const handleExit = async () => {
	clearTimeout(timerId);

	const colorToValueMap = 
		LED_CONSTANTS.ALL_LED_COLORS
		.reduce((acc, color) => {
			acc[color] = false;
			return acc;
		}, {});

	await setLeds(colorToValueMap);

	process.exit();
};

['SIGINT', 'SIGQUIT', 'SIGTERM']
.forEach(async (event) => 
	process.on(event, async () => 
		await handleExit()
	));

const PARAMS = {
	HELP: '-h',
	LIST_TASKS: '-lt',
	TASK: '-t'
};

const TASKS = {
	LEDS_BCWRD_FWRD: 'lbf',

	GPIO_EXPORT: 'ge',
	GPIO_UNEXPORT: 'gu',
	GPIO_SET_DIRECTION: 'gd',
	GPIO_SET_VALUE: 'gv',

	GPIO_API_DETECT: 'gad',
	GPIO_API_INFO: 'gai',
	GPIO_API_INFO_0: 'gai:0',
	GPIO_API_GET: 'gag',
	GPIO_API_GET_ALL: 'gag:all',
	GPIO_API_SET_ON: 'gas:on',
	GPIO_API_SET_OFF: 'gas:off',
	GPIO_API_TOGGLE: 'gat'
};

if (process.argv.length < 3) {
	console.error(`Please provide parameters: npm start -- <params>. Use ${PARAMS.HELP} for help`);
} else {
	switch (process.argv[2]) {
		case PARAMS.HELP:
			console.log();
			console.log('Available commands:');
			console.log(`\t${PARAMS.HELP}\t\t\t Help`);
			console.log(`\t${PARAMS.LIST_TASKS}\t\t\t List of tasks, -t <task>`);
			console.log(`\t${PARAMS.TASK} <task>\t\t\t Execute a task`);
			console.log();
			break;

		case PARAMS.LIST_TASKS:
			console.log();
			console.log('Available tasks:');
			console.log(`\t${TASKS.LEDS_BCWRD_FWRD}\t\t\t Light leds forwards then backwards in an infinitive loop`);
			console.log(`\t${TASKS.GPIO_EXPORT}\t\t\t [Deprecated] Export GPIOs`);
			console.log(`\t${TASKS.GPIO_UNEXPORT}\t\t\t [Deprecated] Unexport GPIOs`);
			console.log(`\t${TASKS.GPIO_SET_DIRECTION}\t\t\t [Deprecated] Set pin direction`);
			console.log(`\t${TASKS.GPIO_SET_VALUE}\t\t\t [Deprecated] Set pin value`);
			console.log(`\t${TASKS.GPIO_API_DETECT}\t\t\t Detect GPIO`);
			console.log(`\t${TASKS.GPIO_API_INFO}\t\t\t Get GPIO info`);
			console.log(`\t${TASKS.GPIO_API_INFO_0}\t\t\t Get GPIO info for bank: 0`);
			console.log(`\t${TASKS.GPIO_API_GET}\t\t\t Get pin values`);
			console.log(`\t${TASKS.GPIO_API_GET_ALL}\t\t\t Get all pin values`);
			console.log(`\t${TASKS.GPIO_API_SET_ON}\t\t\t Set pin values: on`);
			console.log(`\t${TASKS.GPIO_API_SET_OFF}\t\t\t Set pin values: off`);
			console.log(`\t${TASKS.GPIO_API_TOGGLE}\t\t\t Toggle pin values`);
			console.log();
			break;

		case PARAMS.TASK:
			if (process.argv.length < 4) {
				console.error(`Please povide a name of a task to be executed. Use ${PARAMS.LIST_TASKS} to list all tasks`);
			} else {
				const allPins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
				const pin = 1;
				const apiPins = allPins;

				switch (process.argv[3]) {
					case TASKS.LEDS_BCWRD_FWRD:
						ledsFwrdBwrdInf();
						break;
						
					case TASKS.GPIO_EXPORT:
						console.log('Exported pins:', await getExportedPins());
						console.log(`Pin ${pin} exported:`, await isPinExported(pin));
						console.log(`Export pin: ${pin}`);
						await exportPin(pin);	
						console.log(`Pin ${pin} exported:`, await isPinExported(pin));	
						break;
					
					case TASKS.GPIO_UNEXPORT:
						console.log('Exported pins:', await getExportedPins());
						console.log(`Pin ${pin} exported:`, await isPinExported(pin));
						console.log(`Unexport pin: ${pin}`);
						await unexportPin(pin);	
						console.log(`Pin ${pin} exported:`, await isPinExported(pin));	
						break;
									
					case TASKS.GPIO_SET_DIRECTION:
						console.log('Exported pins:', await getExportedPins());
						console.log(`Pin ${pin} direction:`, await getPinDirection(pin));
						console.log(`Set out direction`);
						await setPinDirection(pin, GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION);	
						console.log(`Pin ${pin} direction:`, await getPinDirection(pin));	
						console.log(`Set in direction`);
						await setPinDirection(pin, GPIO_SYSFS_CONSTANTS.GPIO_IN_DIRECTION);	
						console.log(`Pin ${pin} direction:`, await getPinDirection(pin));
						console.log(`Set out direction`);
						await setPinDirection(pin, GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION);		
						break;

					case TASKS.GPIO_SET_VALUE:
						console.log('Exported pins:', await getExportedPins());
						console.log(`Pin ${pin} value:`, await getPinValue(pin));
						console.log(`Set off`);
						await setPinValue(pin, GPIO_SYSFS_CONSTANTS.GPIO_OFF_VALUE);	
						console.log(`Pin ${pin} value:`, await getPinValue(pin));	
						console.log(`Set on`);
						await setPinValue(pin, GPIO_SYSFS_CONSTANTS.GPIO_ON_VALUE);	
						console.log(`Pin ${pin} value:`, await getPinValue(pin));
						break;

					case TASKS.GPIO_API_DETECT:
						console.log('Detected GPIO');
						console.log(await detectGpio());
						break;

					case TASKS.GPIO_API_INFO:
						console.log('GPIO info');
						console.log(await getGpioInfo());
						break;

					case TASKS.GPIO_API_INFO_0:
						console.log('GPIO info for bank: 0');
						console.log(await getGpioInfo(0));
						break;
			
					case TASKS.GPIO_API_GET:
						console.log('GPIO get');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						break;

								
					case TASKS.GPIO_API_GET_ALL:
						console.log('GPIO get all');
						
						const printAllPinsInf = async (pins) => {
							const pinValues = await getPinValues(0, pins)
							console.log(JSON.stringify(pinValues));
							console.log();
							await setTimeout(async () => printAllPinsInf(pins), 1000);
						};

						await printAllPinsInf(allPins);
						break;
	
					case TASKS.GPIO_API_SET_OFF:
						console.log('GPIO set off');
						console.log('Old values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						await setPinValues(0, {6: false, 7: false, 8: false});
						console.log('New values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						break;
																
					case TASKS.GPIO_API_SET_ON:
						console.log('GPIO set on');
						console.log('Old values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						await setPinValues(0, {6: true, 7: true, 8: true});
						console.log('New values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						break;
																
					case TASKS.GPIO_API_TOGGLE:
						console.log('GPIO toggle');
						console.log('Old values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						await togglePinValues(0, apiPins);
						console.log('New values:');
						console.log(JSON.stringify(await getPinValues(0, apiPins)));
						break;
							
					default:
						console.error(`Please provide a proper task name. Use ${PARAMS.LIST_TASKS} to list all tasks`);
				}
			}
			break;

		default:
			console.error(`Please provide parameters: npm start -- <params>. Use ${PARAMS.HELP} for help`);
	}
}