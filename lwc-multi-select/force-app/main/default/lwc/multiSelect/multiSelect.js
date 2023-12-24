import { LightningElement, api, track } from 'lwc';

export default class MultiSelect extends LightningElement {

    @track value_ = ''; //serialized value - ie 'CA;FL;IL' used when / if options have not been set yet
    @track isOpen = false;
    
    rendered = false;
    
    @api width = 100;
    @api variant = '';
    @api label = '';
    @api name = '';
    @api placeholder = '';
    @api dropdownLength = 5;
    @api selectedPills = [];  //seperate from values, because for some reason pills use {label,name} while values uses {label:value}
    @api options;
    @api get value(){
        let selectedValues =  this.selectedValues();
        return selectedValues.length > 0 ? selectedValues.join(";") : "";
    }
    set value(value){
        this.value_ = value;
        this.parseValue(value);
        
    }
    parseValue(value){
        if (!value || !this.options || this.options.length < 1){
        return;
        }
        var values = value.split(";");
        var valueSet = new Set(values);

        this.options = this.options.map(function(option) {
        if (valueSet.has(option.value)){
            option.selected = true;
        }
        return option;
        });
        this.selectedPills = this.getPillArray();
    }
    parseOptions(options){
        if (options != undefined && Array.isArray(options)){
        this.options = JSON.parse(JSON.stringify(options)).map( (option,i) => {
            option.key = i;
            return option;
        });
        }
    }
    //private called by getter of 'value'
    selectedValues(){
        var values = [];
        //if no options set yet or invalid, just return value
        if (this.options.length < 1){
        return this.value_;
        }
        this.options.forEach(function(option) {
        if (option.selected === true) {
            values.push(option.value);
        }
        });
        return values;
    }
    get labelStyle() {
        return this.variant === 'label-hidden' ? ' slds-hide' : ' slds-form-element__label ' ;
    }

    get dropdownOuterStyle(){
        return 'slds-dropdown slds-dropdown_fluid slds-dropdown_length-5' + this.dropdownLength;
    }

    get mainDivClass(){
        var style = ' slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ';
        return this.isOpen ? ' slds-is-open ' + style : style;
    }
    get hintText(){
        if (this.selectedPills.length === 0) {
        return this.placeholder;
        }
        return "";
    }
    openDropdown(){
        this.isOpen = true;
    }
    closeDropdown(){
        this.isOpen = false;
    }
    handleClick(event){
        event.stopImmediatePropagation();
        this.openDropdown();
        window.addEventListener('click', this.handleClose);
    }
    handleClose = (event) => {
        event.stopPropagation();
        this.closeDropdown();
        window.removeEventListener('click', this.handleClose);
    }
    handlePillRemove(event){
        event.preventDefault();
        event.stopPropagation();

        const name = event.detail.item.name;

        this.options.forEach(function(element) {
        if (element.value === name) {
            element.selected = false;
        }
        });
        this.selectedPills = this.getPillArray();
        this.despatchChangeEvent();

    }
    handleSelectedClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const listData = event.detail;
        const { value, selected, shift } = listData;
        this.options = this.options.map( option => {
            if (shift) {
                if (option.value === value) {
                    return {...option, selected:!selected};
                    // return { ...option, selected: selected === true ? false : true };
                }
            }else{
                if (option.value === value) {
                    const optionNueva = {...option, selected:!selected};
                    // const optionNueva = { ...option, selected: selected === true ? false : true };
                    this.closeDropdown();
                    return optionNueva;
                } 
                // else {
                //     try {
                //         option = { ...option, selected: false };
                //     } catch (error) {
                //         console.log(error.message);
                //     }
                // }
            }
            return{
                ...option
            }
        });
        this.selectedPills = this.getPillArray();
        console.log(this.selectedPills);
        console.log('this.selectedPills');
        this.despatchChangeEvent();
    }
    despatchChangeEvent() {
        let values =  this.selectedValues();
        let valueString = values.length > 0 ? values.join(";") : "";
        const eventDetail = {value:valueString};
        const changeEvent = new CustomEvent('change', { detail: eventDetail });
        this.dispatchEvent(changeEvent);
    }
    getPillArray() {
        try {
            let interator = 0;
            return this.options
                .filter(element => element.selected)
                .map(element => ({ label: element.label, name: element.value, key: interator++ }));
        } catch (error) {
            console.log('Error getPillArray ' + error.message);
            return [];
        }
    }
}