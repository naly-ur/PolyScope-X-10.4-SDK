import { TranslateService } from '@ngx-translate/core';
import { converter, FixedPointNumber, Units } from '@universal-robots/utilities-units';
import { InputValidator } from '@universal-robots/ui-models';
import { ValueObjectMap } from '@universal-robots/contribution-api';

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService` and an instance of `ProgramPresenterAPI` from `@universal-robots/contribution-api` as `presenterAPI`.
 * `translateService` is usually provided via dependency injection and  `presenterAPI` is provided as an input to the `CommonProgramPresenterComponent` class.
 * @param ownVarName assumed to be valid variable name
 * @returns `InputValidator` that checks if an input string is a valid variable name.
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ngOnChanges(changes: SimpleChanges){
 *    ...
 *    if (this.translateService && this.presenterAPI && this.contributedNode) {
 *        this.myValidator = getVariableNameValidator.bind(this)(this.contributedNode.parameters.myVariableName)
 *    }
 *    ...
 * }
 */
export function getVariableNameValidator(ownVarName?: string): InputValidator {
    return async (varName: string) => {
        if (!varName) {
            return this.translateService.instant('presenter.variable_name.empty_variable_name_error');
        }
        if (varName.length > 1024) {
            return this.translateService.instant('presenter.variable_name.name_too_long_error');
        }
        if (!varName.match(/^[a-zA-Z]+[\w]*$/)) {
            return this.translateService.instant('presenter.variable_name.variable_name_invalid_error');
        }
        if (varName !== ownVarName && (await this.presenterAPI.symbolService.isRegisteredVariableName(varName))) {
            return this.translateService.instant('presenter.variable_name.variable_name_exists_error');
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService` and an instance of `ProgramPresenterAPI` from `@universal-robots/contribution-api` as `presenterAPI`.
 * `translateService` is usually provided via dependency injection and  `presenterAPI` is provided as an input to the `CommonProgramPresenterComponent` class.
 * @param functionParameter name of the parameter to fetch function from
 * @param moduleName name of enclosing module
 * @returns `InputValidator` that checks if an input string is a valid function name
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ngOnChanges(changes: SimpleChanges){
 *    ...
 *    if (this.translateService && this.presenterAPI && this.contributedNode) {
 *        this.myValidator = getFunctionNameValidator.bind(this)(this.contributedNode.parameters.myFunctionName, this.contributedNode.parameters.myModuleName)
 *    }
 *    ...
 * }
 */
export function getFunctionNameValidator(functionParameter: string, moduleName: string): InputValidator {
    return async (name: string) => {
        const ownFuncName = this.contributedNode?.parameters?.[functionParameter]?.name;
        if (!name) {
            return this.translateService.instant('presenter.validation.empty-function-name-error');
        }
        if (!name.match(/^[a-zA-Z]+\w*$/)) {
            return this.translateService.instant('presenter.validation.function-name-invalid-error');
        }
        if (name !== ownFuncName && (await this.presenterAPI.symbolService.isRegisteredFunctionName(name, moduleName))) {
            return this.translateService.instant('presenter.validation.function-name-exists-error');
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService` and an instance of `ProgramPresenterAPI` from `@universal-robots/contribution-api` as `presenterAPI`.
 * `translateService` is usually provided via dependency injection and  `presenterAPI` is provided as an input to the `CommonProgramPresenterComponent` class.
 * @returns `InputValidator` that checks if an input string is a valid module name
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ngOnChanges(changes: SimpleChanges){
 *    ...
 *    if (this.translateService && this.presenterAPI && this.contributedNode) {
 *        this.myValidator = getModuleNameValidator.bind(this)(this.contributedNode.parameters.myModuleName)
 *    }
 *    ...
 * }
 */
export function getModuleNameValidator(): InputValidator {
    return async (name: string) => {
        const ownModuleName = this.contributedNode?.parameters?.module?.name;
        if (!name) {
            return this.translateService.instant('presenter.validation.empty-module-name-error');
        }
        if (!name.match(/^[a-zA-Z]+\w*$/)) {
            return this.translateService.instant('presenter.validation.module-name-invalid-error');
        }
        if (name !== ownModuleName && (await this.presenterAPI.symbolService.isRegisteredModuleName(name))) {
            return this.translateService.instant('presenter.validation.module-name-exists-error');
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService`
 * `translateService` is usually provided via dependency injection.
 * @returns `InputValidator` that checks that a string is not empty.
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ...
 * this.myValidator = getDescriptionValidator.bind(this)()
 * ...
 */
export function getDescriptionValidator(): InputValidator {
    return (description: string) => {
        if (!description) {
            return this.translateService.instant('presenter.validation.empty-description');
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService`
 * `translateService` is usually provided via dependency injection.
 * @param maxLength
 * @returns `InputValidator` that checks that a strings length is below a given nubmer
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ...
 * this.myValidator = getStringValidator.bind(this)(42)
 * ...
 */
export function getStringValidator(maxLength?: number): InputValidator {
    return (defaultValue: string) => {
        if (defaultValue.length > (maxLength ? maxLength : 1024)) {
            return this.translateService.instant('presenter.validation.string-too-long', { 'max-length': maxLength ? maxLength : 1024 });
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService`
 * `translateService` is usually provided via dependency injection.
 * @param min Minimum value (default: 1)
 * @param minLength Minimum length (default: 1)
 * @returns `InputValidator` that checks that a value is below a given value and a given length
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ...
 * this.myValidator = getXTimesValidator.bind(this)(42)
 * ...
 */
export function getXTimesValidator(min?: number, minLength?: number): InputValidator {
    const _minLength = minLength ? minLength : 1;
    const _min = min ? min : 1;

    return (v: string) => {
        if (v.length < _minLength || Number(v) < _min) {
            return this.translateService.instant('presenter.loop.xtimes.min_length_error', { minLength: _minLength, min: _min });
        }
        return null;
    };
}

/**
 * Caller needs to `bind` an object with an instance of `TranslateService` from `@ngx-translate/core` as `translateService`
 * `translateService` is usually provided via dependency injection.
 * @param minLength Minimum length (default: 1)
 * @param maxLength Maximum length (default: 1000)
 * @returns `InputValidator` that checks that a strings length is within a given length
 * @example
 * //Example usage in a program node:
 * export class MyNodeComponent extends CommonProgramPresenterComponent<MyNode>...
 * constructor(private readonly translateService: TranslateService){...}
 * ...
 * this.myValidator = getExpressionValidator.bind(this)(42)
 * ...
 */
export function getExpressionValidator(minLength?: number, maxLength?: number): InputValidator {
    const _minLength = minLength ? minLength : 1;
    const _maxLength = maxLength ? maxLength : 1000;
    const pattern = `^.{${_minLength},${_maxLength}}$`;
    return (v: string) =>
        v?.match(pattern)
            ? null
            : this.translateService.instant('presenter.validation.expression-invalid-error', {
                  minLength: _minLength,
                  maxLength: _maxLength,
              });
}

export interface ValueConstraints {
    lowerLimit: number;
    upperLimit: number;
    unit: string;
}
export function getRangeErrorString(val: number, constraints: ValueConstraints, units: Units, translateService: TranslateService): string {
    const constraintUnit = ValueObjectMap[constraints.unit];
    const lowerLimit = converter(new FixedPointNumber(constraints.lowerLimit, constraintUnit), units[constraintUnit.quantity.quantity]);
    const upperLimit = converter(new FixedPointNumber(constraints.upperLimit, constraintUnit), units[constraintUnit.quantity.quantity]);
    const scale = 10 ** constraintUnit.significantDigits;
    return val >= Math.ceil(lowerLimit.getValue() * scale) / scale && val <= Math.floor(upperLimit.getValue() * scale) / scale
        ? null
        : translateService.instant('range-error', {
              min: `${Math.ceil(lowerLimit.getValue() * scale) / scale} ${lowerLimit.getUnit().symbol}`,
              max: `${Math.floor(upperLimit.getValue() * scale) / scale} ${upperLimit.getUnit().symbol}`,
          });
}
