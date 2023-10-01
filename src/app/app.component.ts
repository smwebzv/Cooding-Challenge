import { Component } from '@angular/core';
import { areElementsStructurallyEqual } from './helpers/elementPredictions';

type actionType = 'buttonClick' | 'inputField' | undefined;
type contextStageType = 'unclocked' | 'loop' | 'bot-running';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'coding-challenge-v2';

  predictionElements: HTMLElement[] = [];

  firstStepPredictedElements: HTMLElement[] = [];
  clickButtonPredictedElements: HTMLElement[] = [];
  inputTextPredictedElements: HTMLElement[] = [];

  contextStage: contextStageType = 'unclocked';
  showEnterValueForInputs: boolean = false;

  selectedItemCount: number = 0;
  currentStep: number = 0;
  addActionType: actionType;
  inputValue: string = '';

  tasks = [
    {
      title: 'task 1',
      completed: false,
    },
    {
      title: 'task 2',
      completed: false,
    },
    {
      title: 'task 3',
      completed: false,
    },
    {
      title: 'task 4',
      completed: false,
    },
  ];

  completedTasks = [
    {
      title: 'task 5',
      completed: false,
    },
    {
      title: 'task 6',
      completed: false,
    },
    {
      title: 'task 7',
      completed: false,
    },
    {
      title: 'task 8',
      completed: false,
    },
  ];

  stopClicks: boolean = false;

  addTask(description: string) {
    this.tasks.push({
      title: description,
      completed: false,
    });
  }

  deleteTask(task: any) {
    let index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }

  /**
   * The code bellow belongs to Automation content
   */

  /**
   *
   * @returns element collection for prediction and color for predicted items based on current step
   */
  getElementGroupForSpecStep() {
    if (this.currentStep == 1) {
      // On step one return all elements in main search box and mark them with red color
      const mainWraper = document.getElementById("app")?.children[0];
      return {
        collection: mainWraper!.querySelectorAll('*'),
        color: 'red',
      };
    } else {
      // On other steps go through all predicted elements, get all elements inside them and add them all to one array.
      let allElements: Element[] = [];
      this.firstStepPredictedElements
        .map((item) => Array.from(item.querySelectorAll('*')))
        .map((item) => {
          allElements = allElements.concat([...item]);
        });
      return { collection: allElements, color: 'green' };
    }
  }

  /**
   *
   * @param element
   * @returns check for element type based on action type. If action is button then search for only buttons to be predicted
   * if action is input search only input elements to be predicted so we can add text inside them
   * in default we dont need to filter elements.
   */

  checkElementPropertyOnAction(element: HTMLElement) {
    switch (this.addActionType) {
      case 'buttonClick':
        return (
          typeof element.click === 'function' && element.tagName !== 'INPUT'
        );
      case 'inputField':
        return element.tagName === 'INPUT';
      default:
        return true;
    }
  }

  /**
   * Function for marking predicted elements
   * @param event
   */
  searchForElementPrediction = (event: Event) => {
    // If we have saved elements for loop and we are in stage where we need to select action dont do nothing while hovering the elements
    if (this.contextStage == 'loop') return;

    // Current element that has been hovered
    const hoverElement = event.target as HTMLElement;

    const { collection, color } = this.getElementGroupForSpecStep();

    if (
      !this.firstStepPredictedElements.includes(hoverElement) &&
      !this.clickButtonPredictedElements.includes(hoverElement) &&
      !this.inputTextPredictedElements.includes(hoverElement)
    )
      hoverElement.style.outline = `2px dotted ${color}`;

    this.predictionElements = [];

    // collection is HTMLElement collections that we check for prediction on hovered element.
    collection?.forEach((element) => {
      const checkElement = element as HTMLElement;

      // Mark elements with red outline if element maches hovered element and it is not inside already saved element list
      if (
        areElementsStructurallyEqual(element, hoverElement) &&
        !this.firstStepPredictedElements.includes(checkElement) &&
        !this.clickButtonPredictedElements.includes(checkElement) &&
        !this.inputTextPredictedElements.includes(checkElement) &&
        this.checkElementPropertyOnAction(checkElement)
      ) {
        checkElement.style.outline = '2px dotted red';
        this.predictionElements.push(checkElement);
      }
      // Remove outline from all elements except the ones we already saved in one of steps
      else if (
        !this.firstStepPredictedElements.includes(checkElement) &&
        !this.clickButtonPredictedElements.includes(checkElement) &&
        !this.inputTextPredictedElements.includes(checkElement)
      ) {
        checkElement.style.outline = '';
      }
    });
  };

  /**
   * Click on element function
   * @param event
   * @description This function is for clicking on predicted element and element that is hovered on
   * By clicking on element we store element to predict array ( array is based on step we are currently on )
   * and adding corresponding outline color
   */

  handleClickOnPredictElements = (event: Event) => {
    // If bot is running allow click on page elements
    if (this.contextStage == 'bot-running') return;

    // Prevent default click on elements so when we click to select element dont trigger actual Angular function
    event.stopPropagation();
    event.preventDefault();

    // Prevent default click but dont allow selecting next elements until we select next action
    if (this.contextStage == 'loop') return;

    const element = event.target as HTMLElement;

    // Based on action type we store predicted elements on their corresponding arrays and adding them corresponding colors
    switch (this.addActionType) {
      case 'buttonClick':
        element.style.outline = 'green dotted 2px';
        // if array is empty or doesnt include clicked element save all predicted elements to click button array
        if (!this.clickButtonPredictedElements.includes(element))
          this.clickButtonPredictedElements = this.predictionElements;
        break;
      case 'inputField':
        element.style.outline = 'green dotted 2px';
        // if array is empty or doesnt include clicked element save all predicted elements to input array
        if (!this.inputTextPredictedElements.includes(element))
          this.inputTextPredictedElements = this.predictionElements;
        break;
      default:
        element.style.outline = 'blue dotted 2px';

        // if array is not empty or it includes clicked element increase selectedItemCount so user knows how many he already selected
        if (this.firstStepPredictedElements.includes(element)) {
          this.selectedItemCount += 1;
        } else {
          this.selectedItemCount = 1;
          this.firstStepPredictedElements.map((element) => {
            element.style.outline = '';
          });

          // main predicted elements is empty so we populate it with all elements that have predicted based on hovered element
          this.firstStepPredictedElements = this.predictionElements;
        }
    }
  };

  /**
   * Start loop - add mouseover and click listener to main wraper so user can se prediction outlines and he can choose predict elements
   * changing current step to 1 will move to next screen
   */
  startLoop() {
    const mainWraper = document.getElementById("app")?.children[0];
    this.addEventListeners(mainWraper!);
    this.currentStep = 1;
  }

  /**
   * Add event listeners to element
   * @param element HTMLElement we want to add event listeners
   * @description Adding mousemove event user can see predicting oulines on hovered elements
   * Adding click event we stops default click on Angular elements, for example: in this stage user cannot add/remove any task
   */
  addEventListeners(element: Element) {
    element?.addEventListener('mousemove', this.searchForElementPrediction);
    element?.addEventListener('click', this.handleClickOnPredictElements, true);
  }

  /**
   * Remove event listeners from element
   * @param element HTMLElement we want to remove event listeners
   * @description Removing mousemove event we remove predicting outline on hovered elements
   * Removing click event we allow user to use normal functionalities on angular app
   */
  removeEventListeners(element: Element) {
    element?.removeEventListener('mousemove', this.searchForElementPrediction);

    element?.removeEventListener(
      'click',
      this.handleClickOnPredictElements,
      true
    );
  }

  /**
   * Save the main loop predicted elements
   * @param step currentStep next value
   */
  saveLoop(step: number) {
    // Change current step to next step
    this.currentStep = step;

    // If we are in context of saving loops for "inside" actions
    if (
      this.addActionType == 'buttonClick' ||
      this.addActionType == 'inputField'
    ) {
      // Change all elements outline color to green
      this.clickButtonPredictedElements.map((element) => {
        element.style.outline = 'green dotted 2px';
      });
    } else {
      // Change all elements outline color to red
      this.firstStepPredictedElements.map((element) => {
        element.style.outline = 'blue dotted 2px';
      });
    }

    // Remove all listeners from main wraper so we dont predict elements anymore
    const mainWraper = document.getElementById("app")?.children[0];

    this.removeEventListeners(mainWraper!);

    // Add event listeners to main loop elements
    this.firstStepPredictedElements.map((item) => {
      this.addEventListeners(item);
    });

    // change context stage to loop so we prevent clicking on hovered elements but we still prevent default Angular cliks
    this.contextStage = 'loop';
  }

  /**
   * Choose Click a button Action and move to step 3 where we need to select button elements for click
   */
  clickAButton() {
    this.addActionType = 'buttonClick';
    this.currentStep = 3;
    this.contextStage = 'unclocked';
  }

  /**
   * Choose Input Action and move to step 3 where we need to select input elements for inserting the entered text
   */
  inputText() {
    this.addActionType = 'inputField';
    this.currentStep = 3;
    this.contextStage = 'unclocked';
  }

  /**
   * Save button/input predicted elements
   * @description If we save input action we dont go to step 2, insted we change showEnterValueForInputs
   * to true so user can see input for entering the text
   */
  saveAction() {
    if (this.addActionType == 'buttonClick') {
      // When savign button action, mark all saved elements outline to green
      this.clickButtonPredictedElements.map((element) => {
        element.style.outline = 'green dotted 2px';
      });
      this.currentStep = 2;
      this.contextStage = 'loop';
      // If we previously reset field and we moved again to enter button action, hide input for input action if he is showed
      this.showEnterValueForInputs = false;
    } else if (this.addActionType == 'inputField') {
      // When we save Input action next step is to show input for insert text, in this case we dont go to next screen
      if (!this.showEnterValueForInputs) {
        this.inputTextPredictedElements.map((element) => {
          element.style.outline = 'green dotted 2px';
        });
        this.showEnterValueForInputs = true;
      } else {
        this.currentStep = 2;
      }
    }
  }

  /**
   * Reset variables to their first values,
   * remove outlines from elements,
   * remove event listeners
   */
  resetAllValues() {
    this.clickButtonPredictedElements.map((element) => {
      element.style.outline = '';
      this.removeEventListeners(element);
    });
    this.firstStepPredictedElements.map((element) => {
      element.style.outline = '';
      this.removeEventListeners(element);
    });
    this.inputTextPredictedElements.map((element) => {
      element.style.outline = '';
      this.removeEventListeners(element);
    });

    this.clickButtonPredictedElements = [];
    this.firstStepPredictedElements = [];
    this.inputTextPredictedElements = [];
    this.predictionElements = [];
    this.selectedItemCount = 0;
    this.inputValue = '';
    this.addActionType = undefined;
    this.showEnterValueForInputs = false;
  }

  /**
   * Run bot function
   * @description
   * When we run the bot, we go over all saved predicted elements.
   * Array will be empty for those actions that are not saved.
   */
  runBot() {
    this.contextStage = 'bot-running';

    // Go over Input predicted elements and add value from input model that user needs to fill
    this.inputTextPredictedElements.map((element) => {
      const el = element as HTMLInputElement;
      // If input field is empty dont do anything to input elements
      if (this.inputValue) {
        el.value = this.inputValue;
      }
    });

    // Go over all predicted elements for button action and click on them
    this.clickButtonPredictedElements.map((element) => {
      element.click();
    });

    // Return stage to unlocked
    this.contextStage = 'unclocked';
    // Reset values and reset step to begining
    this.resetAllValues();
    this.currentStep = 0;
  }

  /**
   * User can go to third step, select one of actions and wish to go back
   * We move all variables to position before clicking on choosing action on third step
   */

  resetThirdStep() {
    this.currentStep = 2;
    this.showEnterValueForInputs = false;
    this.inputValue = '';

    if (this.addActionType == 'buttonClick') {
      // Remove outline and event listeners on predicted elements
      this.clickButtonPredictedElements.map((element) => {
        element.style.outline = '';
        this.removeEventListeners(element);
      });
    } else {
      // Remove outline and event listeners on predicted elements
      this.inputTextPredictedElements.map((element) => {
        element.style.outline = '';
        this.removeEventListeners(element);
      });
    }
    this.addActionType = undefined;
    this.contextStage = 'loop';
  }

  /**
   * Reset first step
   * @description User can move to step where he is choosing loop elements and he wants to go back,
   * this function reset all fields
   */
  resetFirstStep() {
    this.currentStep = 0;
    const mainWraper = document.getElementById("app")?.children[0];
    this.removeEventListeners(mainWraper!);
    this.resetAllValues();
  }
}
