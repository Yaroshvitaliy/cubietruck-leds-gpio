import { readFile, writeFile, access, readdir } from 'fs/promises';

const GPIO_DIR = '/sys/class/gpio/';
const GPIO_EXPORT_FILE_NAME = `${GPIO_DIR}export`;
const GPIO_UNEXPORT_FILE_NAME = `${GPIO_DIR}unexport`;

export const GPIO_SYSFS_CONSTANTS = {
    GPIO_OFF_VALUE: '0',
    GPIO_ON_VALUE: '1',
    GPIO_IN_DIRECTION: 'in',
    GPIO_OUT_DIRECTION: 'out'
};

const isPinValid = (pin) => pin >= 0

const createInvalidPinErrMsg = (message, pin) => 
    `${message}. Wrong pin provided: '${pin}'`; 

const isDirectionValid = (direction) => 
    [GPIO_SYSFS_CONSTANTS.GPIO_IN_DIRECTION, GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION]
    .includes(direction);

const createInvalidDirectionErrMsg = (message, direction) =>
    `${message}. Wrong direction provided: '${direction}'. Possible values: ${GPIO_SYSFS_CONSTANTS.GPIO_IN_DIRECTION}, ${GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION}`;

const isPinValueValid = (value) =>
    [GPIO_SYSFS_CONSTANTS.GPIO_OFF_VALUE, GPIO_SYSFS_CONSTANTS.GPIO_ON_VALUE]
    .includes(value);

const createInvalidValueErrMsg = (message, value) =>
    `${message}. Wrong value provided: '${value}'. Possible values: ${GPIO_SYSFS_CONSTANTS.GPIO_OFF_VALUE}, ${GPIO_SYSFS_CONSTANTS.GPIO_ON_VALUE}`;

const getPinDir = (pin) => `${GPIO_DIR}gpio${pin}/`;

const getDirectionFileName = (pin) => `${getPinDir(pin)}direction`;

const getValueFileName = (pin) => `${getPinDir(pin)}value`;

export const getExportedPins = async () => {
    const files = await readdir(GPIO_DIR);
    const pins = files
        .filter(f => f.indexOf('gpiochip') < 0)
        .filter(f => f.indexOf('gpio') === 0)
        .map(f => f.substring('gpio'.length))
        .map(Number);

    return pins;
};

export const isPinExported = async (pin) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to get a value indicating whether a pin is exported', pin));
    }

    try {
        await access(getPinDir(pin));
        return true;
    } catch {
        return false;
    }
};

export const exportPin = async (pin) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to export a pin', pin));
    }

    return await writeFile(GPIO_EXPORT_FILE_NAME, pin.toString());
};

export const unexportPin = async (pin) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to unexport a pin', pin));
    }

    return await writeFile(GPIO_UNEXPORT_FILE_NAME, pin.toString());
};

export const getPinDirection = async (pin) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to get a direction of a pin', pin));
    }

    const directionFileName = getDirectionFileName(pin);
    const data = await readFile(directionFileName, 'utf8');

    if (data.includes(GPIO_SYSFS_CONSTANTS.GPIO_IN_DIRECTION)) {
        return GPIO_SYSFS_CONSTANTS.GPIO_IN_DIRECTION;
    }

    if (data.includes(GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION)) {
        return GPIO_SYSFS_CONSTANTS.GPIO_OUT_DIRECTION;
    }

    throw new Error(`Failed to get a direction of a pin: '${pin}'`);
};

export const setPinDirection = async (pin, direction) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to set a direction', pin));
    }

    if (!isDirectionValid(direction)) {
        throw new Error(createInvalidDirectionErrMsg(`Failed to set a direction for a pin: '${pin}'`), direction);
    }

    const directionFileName = getDirectionFileName(pin);
    return await writeFile(directionFileName, direction);
};

export const getPinValue = async (pin) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to get a value of a pin', pin));
    }

    const valueFileName = getValueFileName(pin);
    const data = await readFile(valueFileName, 'utf8');

    if (data.includes(GPIO_SYSFS_CONSTANTS.GPIO_OFF_VALUE)) {
        return GPIO_SYSFS_CONSTANTS.GPIO_OFF_VALUE;
    }

    if (data.includes(GPIO_SYSFS_CONSTANTS.GPIO_ON_VALUE)) {
        return GPIO_SYSFS_CONSTANTS.GPIO_ON_VALUE;
    }

    throw new Error(`Failed to get a value of a pin: '${pin}'`);
};

export const setPinValue = async (pin, value) => {
    if (!isPinValid(pin)) {
        throw new Error(createInvalidPinErrMsg('Failed to set a value of a pin', pin));
    }

    if (!isPinValueValid(value)) {
        throw new Error(createInvalidValueErrMsg(`Failed to set a value for a pin: '${pin}'`, pin));
    }

    const valueFileName = getValueFileName(pin);
    return await writeFile(valueFileName, value);
};