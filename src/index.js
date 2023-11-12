import {
	LED_CONSTANTS,
    allLedColors,
	getLed,
    setLed,
    toggleLed,
	getAllLeds,
	setAllLeds,
	toggleAllLeds
} from './cubietruck-leds.js';

import {
	GPIO_CONSTANTS,
	getExportedPins,
	isPinExported,
	exportPin,
	unexportPin,
	getPinDirection,
	setPinDirection,
	getPinValue,
	setPinValue
} from './cubietruck-gpio.js';

let ledColorIndex = 0;
let forwardDirection = true; 
let timerId;

const ledsFwrdBwrdInf = async () => {
	allLedColors.forEach(async (color) => 
		await setLed(color, ledColorIndex === allLedColors.indexOf(color))
	);

	forwardDirection && (ledColorIndex === allLedColors.length - 1) && (forwardDirection = false);
	!forwardDirection && (ledColorIndex === 0) && (forwardDirection = true);
	forwardDirection ? (ledColorIndex++) : (ledColorIndex--);

	timerId = await setTimeout(async () => 
		await ledsFwrdBwrdInf(), 
		150
	);
};

const handleExit = async () => {
	clearTimeout(timerId);
	await setAllLeds(false);
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
	GPIO_SET_VALUE: 'gv'
};

if (process.argv.length < 3) {
	console.error(`Please provide parameters: npm start -- <params>. Use ${PARAMS.HELP} for help`);
} else {
	switch (process.argv[2]) {
		case PARAMS.HELP:
			console.log();
			console.log('Available commands:');
			console.log(`\t${PARAMS.HELP}\t\t\thelp`);
			console.log(`\t${PARAMS.LIST_TASKS}\t\t\tlist of tasks, -t <task>`);
			console.log(`\t${PARAMS.TASK} <task>\t\t\texecute a task`);
			console.log();
			break;

		case PARAMS.LIST_TASKS:
			console.log();
			console.log('Available tasks:');
			console.log(`\t${TASKS.LEDS_BCWRD_FWRD}\t\t\tlight leds forwards then backwards in an infinitive loop`);
			console.log();
			break;

		case PARAMS.TASK:
			if (process.argv.length < 4) {
				console.error(`Please povide a name of a task to be executed. Use ${PARAMS.LIST_TASKS} to list all tasks`);
			} else {
				const pin = 1; //TODO: REMOVE
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
						await setPinDirection(pin, GPIO_CONSTANTS.GPIO_OUT_DIRECTION);	
						console.log(`Pin ${pin} direction:`, await getPinDirection(pin));	
						console.log(`Set in direction`);
						await setPinDirection(pin, GPIO_CONSTANTS.GPIO_IN_DIRECTION);	
						console.log(`Pin ${pin} direction:`, await getPinDirection(pin));
						console.log(`Set out direction`);
						await setPinDirection(pin, GPIO_CONSTANTS.GPIO_OUT_DIRECTION);		
						break;

					case TASKS.GPIO_SET_VALUE:
						console.log('Exported pins:', await getExportedPins());
						console.log(`Pin ${pin} value:`, await getPinValue(pin));
						console.log(`Set off`);
						await setPinValue(pin, GPIO_CONSTANTS.GPIO_OFF_VALUE);	
						console.log(`Pin ${pin} value:`, await getPinValue(pin));	
						console.log(`Set on`);
						await setPinValue(pin, GPIO_CONSTANTS.GPIO_ON_VALUE);	
						console.log(`Pin ${pin} value:`, await getPinValue(pin));
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