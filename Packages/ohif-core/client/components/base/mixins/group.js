import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

/*
 * group: controls a group and its registered items
 */
OHIF.mixins.group = new OHIF.Mixin({
    dependencies: 'formItem',
    composition: {
        onCreated() {
            const instance = Template.instance();
            const component = instance.component;

            // Run this computation every time the schema property is changed
            instance.autorun(() => {
                let schema = instance.data.schema;

                // Check if the schema is reactive
                if (schema instanceof ReactiveVar) {
                    // Register a dependency on schema property
                    schema = schema.get();
                }

                // Set the form's data schema
                component.schema = schema && schema.newContext();
            });

            // Get or set the child components values
            component.value = value => {
                const isGet = _.isUndefined(value);
                const isArray = instance.data.arrayValues;
                const result = isArray ? [] : {};

                if (isGet) {
                    component.registeredItems.forEach(child => {
                        if (!isArray) {
                            const key = child.templateInstance.data.key;
                            if (key) {
                                result[key] = child.value();
                            }
                        } else {
                            result.push(child.value());
                        }
                    });
                    return result;
                }

                const groupValue = typeof value === 'object' ? value : result;
                let i = 0;
                component.registeredItems.forEach(child => {
                    const key = isArray ? i : child.templateInstance.data.key;
                    const childValue = _.isUndefined(groupValue[key]) ? null : groupValue[key];
                    child.value(childValue);
                    i++;
                });
                component.$element.trigger('change');
            };

            // Get a registered item in form by its key
            component.item = itemKey => {
                let found;

                // Iterate over each registered form item
                component.registeredItems.forEach(child => {
                    const key = child.templateInstance.data.key;

                    // Change the found item if current key is the same as given
                    if (key === itemKey) {
                        found = child;
                    }
                });

                // Return the found item or undefined if it was not found
                return found;
            };

            // Check if the form data is valid in its schema
            component.validate = () => {
                // Assume validation result as true
                let result = true;

                // Return true if there's no data schema defined
                if (!component.schema) {
                    return result;
                }

                // Iterate over each registered form item and validate it
                component.registeredItems.forEach(child => {
                    const key = child.templateInstance.data.key;

                    // Change result to false if any form item is invalid
                    if (key && !child.validate()) {
                        result = false;
                    }
                });

                // Return the validation result
                return result;
            };

            // Disable or enable the component
            component.disable = isDisable => {
                component.registeredItems.forEach(child => child.disable(isDisable));
            };

            // Set or unset component's readonly property
            component.readonly = isReadonly => {
                component.registeredItems.forEach(child => child.readonly(isReadonly));
            };

        },

        onRendered() {
            const instance = Template.instance();
            const component = instance.component;

            // Set the element to be controlled
            component.$element = instance.$('.component-group:first');
        }
    }
});
