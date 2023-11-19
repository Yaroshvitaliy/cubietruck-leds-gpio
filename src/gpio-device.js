import { exec } from 'child_process';

const GPIO_OFF_VALUE = '0';
const GPIO_ON_VALUE = '1';

const GPIO_DETECT_CMD = 'gpiodetect';
const GPIO_INFO_CMD = 'gpioinfo';
const GPIO_GET_CMD = 'gpioget';
const GPIO_SET_CMD = 'gpioset';

const createGpioInfoCommand = (bank) => 
    typeof bank !== 'undefined' && bank !== null 
        ? `${GPIO_INFO_CMD} ${bank}` 
        : GPIO_INFO_CMD;

const createGpioGetCommand = (bank, pins) => 
    `${GPIO_GET_CMD} ${bank} ${pins.join(' ')}`;

const createGpioSetCommand = (bank, pinToValueMap) => {
    const pinCmd = 
        Object.entries(pinToValueMap)
        .map(([pin, value]) => 
            `${pin}=${value ? GPIO_ON_VALUE : GPIO_OFF_VALUE}`
        )
        .join(' ');
    const command = `${GPIO_SET_CMD} ${bank} ${pinCmd}`;
    return command;
};

const createDetectGpioResult = (stdout) => {
    return stdout;
};

const createGpioInfoResult = (stdout) => {
    return stdout;
};

const createGetPinResult = (stdout, pins) => {
    const pinToValueMap = 
        stdout
        .split(' ')
        .map(v => v === GPIO_ON_VALUE)
        .map((v, i) => [pins[i], v])
        .reduce((acc, [p, v]) => {
            acc[p] = v;
            return acc;
        }, {});
    
    return pinToValueMap;
};

const executeCommand = (command) =>
    new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(stderr);
                return;
            } else {
                resolve(stdout);
            }
        });
    });

export const detectGpio = async () => {
    const command = GPIO_DETECT_CMD;
    const stdout = await executeCommand(command);
    const result = createDetectGpioResult(stdout);
    return result;
};

export const getGpioInfo = async (bank) => {
  const command = createGpioInfoCommand(bank);
  const stdout = await executeCommand(command);
  const result = createGpioInfoResult(stdout);
  return result;
};

export const getPinValues = async (bank, pins) => {
    const command = createGpioGetCommand(bank, pins);
    const stdout = await executeCommand(command);
    const result = createGetPinResult(stdout, pins);
    return result;
};

export const setPinValues = async (bank, pinToValueMap) => {
    const command = createGpioSetCommand(bank, pinToValueMap);
    await executeCommand(command);
};

export const togglePinValues = async (bank, pins) => {
    const oldPinToValueMap = await getPinValues(bank, pins);
    const newPinToValueMap = 
        Object.entries(oldPinToValueMap)
        .reduce((acc, [p, v]) => {
            acc[p] = !v;
            return acc;
        }, {});

    await setPinValues(bank, newPinToValueMap);
};