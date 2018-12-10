//BUDGET CONTROLLER
var budgetController = (function () {
    // create an object for expenses
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPorcentage = function () {
        return this.percentage;
    };
    // create an object for incomes
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // create an array to store new objects
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        porcentage: -1
    };
    // when call budgetController return this functions
    return {
        // when call budgetController.addItem return this exactly function
        addItem: function (type, des, val) {
            var newItem, ID;
            // Create new ID > last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create new item(register) based on 'inc' or 'exp' type
            if (type === 'exp') {
                //create a new objetc based in Expense
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                //create a new objetc based in Income
                newItem = new Income(ID, des, val);
            }
            // Push it into our data structure (add to the end of array)
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            // diference between map and forEach is that map returns a brand new array
            // search for id in array // map is a loop
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            // index = position of id in array
            index = ids.indexOf(id);
            // return -1 if didn't find the id
            if (index !== -1) {
                // get the position and remove only 1 item
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.porcentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPorcentages: function () {
            var allPerc;
            allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPorcentage();
            });
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.porcentage
            };
        },
        // only for test all
        // after add type on browser console budgetController.testing() to check
        testing: function () {
            console.log(data);
        }
    };
})();

// UI CONTROLLER
var UIController = (function () {
    // put all selectors in the same place > easier to update in the further if need
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    // when call UIController return this functions
    return {
        // when call UIController.getInput return this exactly function
        getInput: function () {
            return {
                // get values os inputs
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                // parseFloat will convert string for a number acepting decimal (10.50)
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        // function to add item in the list of expenses and incomes
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // create HTML string placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%description%', obj.description);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorID) {
            var el;
            el = document.getElementById(selectorID)
            // we can't only delete the element, we needs to delete de child too.
            el.parentNode.removeChild(el);
        },
        // function to clear al fields after add item/register. This help to no duplicate line/register/item
        clearFields: function () {
            var fields, fieldsArr;
            // select all field in a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // convert selected elements in array
            fieldsArr = Array.prototype.slice.call(fields);
            // loop into array to change value to empty
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            // put focus back for the first element (description)
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        // when call UIController.getDOMstrings return this exactly function
        getDOMstrings: function () {
            // send the standard selectors for other functions/modules
            return DOMstrings;
        }
    };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    // identify new input on click or when press enter
    var setupEventListeners = function () {
        // call selectors from UICtrl (function = getDOMstrings)
        var DOM = UICtrl.getDOMstrings();
        // when click on add__btn call ctrlAddItem item (to get the value os inputs)
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // when press 'enter' call ctrlAddItem item (to get the value os inputs)
        document.addEventListener('keypress', function (event) {
            //which for other browsers
            if (event.keyCode === 13 || event.which === 13) {
                // only call if the key pressed is 'enter/return'
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read from the budget controller
        var percentages = budgetCtrl.getPorcentages();

        // 3. update the UI with the new percentages
        console.log(percentages);
    }
    // called from setupEventListeners / when click or press enter to insert a new register/item
    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get the filed input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to de UI
            UICtrl.addListItem(newItem, input.type);

            // 4. cliear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) { // only enter in if statement if is true
            splitID = itemID.split('-');
            type = splitID[0];
            // parseInt convert string for integers numbers (no decimals)
            ID = parseInt(splitID[1]);
        }
        // 1. delete item from the data structure
        budgetCtrl.deleteItem(type, ID);
        // 2. delete th item from the UI
        UICtrl.deleteListItem(itemID);
        // 3. Update and show the new budget
        updateBudget();
    };
    // when call controller return this
    return {
        // when call controller.init() return this
        init: function () {
            // console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);
// make tha magic happens, the uniq public comand
controller.init();