import { browser } from 'protractor';
import { LoginPage } from '../page-objects/login/login.po';
import { MainPage } from '../page-objects/main/main.po';
import { AllergyDetailPage } from '../page-objects/allergy/allergy-detail/allergy-dialog.po';
import { NavigationService } from '../services/navigation.service';
import { TestUtil } from '../utilities/test-util';
import { FormService, FormData, ButtonState } from '../services/form.service';

declare const allure: any;

describe('TC0002_AllergyManagement_e2e', () => {
    const loginPage = new LoginPage();
    const mainPage = new MainPage();
    const allergyDetailPage = new AllergyDetailPage();

    beforeAll(() => {
	    NavigationService.navigateToHomePage(loginPage);
	    NavigationService.login(loginPage);
	    NavigationService.navigateToAllergyMaintenancePage(mainPage);
    });

    beforeEach(() => {
        TestUtil.init('TC0002_AllergyManagement_e2e', 'Purpose: This TC is intended to verify the CRUD of an Allergy',
            loginPage.appVersion, 'userName');
    });

    function getFormData(i?: number): FormData[]{
        const baseAllergyValues = ['Name', 'A sign', 'A symptom'];
        const empty = (i === undefined);
        const formData: FormData[] = [{
            field: allergyDetailPage.getNameInput().getElement(),
            name: 'Name',
            value: empty ? '' : 'Try #' + i + ': ' + baseAllergyValues[0]
        }, {
            field: allergyDetailPage.getSignsInput().getElement(),
            name: 'Signs',
            value: empty ? '' : 'Try #' + i + ': ' + baseAllergyValues[1]
        }, {
            field: allergyDetailPage.getSymptomsInput().getElement(),
            name: 'Symptoms',
            value: empty ? '' : 'Try #' + i + ': ' + baseAllergyValues[2]
        }];
        return (formData);
    }

    it('Open allergy creation dialog', () => {
        const title = 'Create Allergy';
        const buttons: ButtonState[] = [{
            name: 'Create',
            exist: true,
            enable: true
        }];

	      NavigationService.checkPresentAndDisplayed(mainPage);
        mainPage.getAllergyAddButton().click();
	      NavigationService.checkPageTitleAndButtons(allergyDetailPage,title, buttons);
        TestUtil.checkForm(getFormData(), 'Allergy Creation is empty');
    });

    it('Close the dialog', () => {
        allergyDetailPage.getButtonClose()
            .click();
        allure.createStep('Dialog is closed', () => {
	        NavigationService.checkPresentAndDisplayed(mainPage);
        })();
    });

    it('Create Allergies', () => {
        for (let i = 1; i <= browser.params.repeatabilityNumberPasses; i++) {

            allure.createStep('Action: Create the allergy ' + i, () => {

                mainPage.getAllergyAddButton().click();
                NavigationService.checkPresentAndDisplayed(allergyDetailPage);

                FormService.fillForm(getFormData(i), 'Allergy Creation Form');
                TestUtil.checkForm(getFormData(i), 'Allergy Creation is correct');

                allergyDetailPage.getButtonSubmit().click();
	              NavigationService.checkPresentAndDisplayed(mainPage);
                TestUtil.checkNumber(mainPage.getAllergyGrid().getNumberOfRows(), 'Number of Allergies', i);

                mainPage.getAllergyGrid().getRow(i-1)
                  .then((cellValues) => {
                      TestUtil.checkText(Promise.resolve(cellValues[1]), 'Col Name', getFormData(i)[0].value);
                      TestUtil.checkText(Promise.resolve(cellValues[2]), 'Col Signs', getFormData(i)[1].value);
                      TestUtil.checkText(Promise.resolve(cellValues[3]), 'Col Symptoms', getFormData(i)[2].value);
                  });
            })();
        }
    });

		 it('Contextual menu at the allergies grid', async () => {

         const menuItems = ['Update', 'Delete'];
         for (let row = 0; row < browser.params.repeatabilityNumberPasses; row++) {
         	    await allure.createStep('Action: Access to the contextual menu at row ' + row + ' in the grid with the buttons: ' + JSON.stringify(menuItems), async () => {
                 await mainPage.getAllergyGrid().clickOnRowMenu(row);
	               await mainPage.getAllergyGrid().getMenu().getOptions().then(async (options)=>{
                     TestUtil.checkText(Promise.resolve(options[0]), 'First Option', menuItems[0]);
                     TestUtil.checkText(Promise.resolve(options[1]), 'Second Option', menuItems[1]);
                     await mainPage.getAllergyGrid().clickOnHeader();
                 });
             })();
         }
		 });

		 it('The option Update opens Allergy Detail', () => {
				 const optionMenuUpdate = 0;
         mainPage.getAllergyGrid().clickOnRowMenu(0);
         mainPage.getAllergyGrid().getMenu().selectOption(optionMenuUpdate);
         NavigationService.checkPresentAndDisplayed(allergyDetailPage);

				 allergyDetailPage.getButtonClose().click();
			   NavigationService.checkPresentAndDisplayed(mainPage);
		 });
		 it('Click on a row and open Allergy Detail', () => {
         mainPage.getAllergyGrid().clickOnCell(0, 'name');
			   NavigationService.checkPresentAndDisplayed(allergyDetailPage);
				 allergyDetailPage.getButtonClose().click();
				 NavigationService.checkPresentAndDisplayed(mainPage);
		 });

				 it('Modify Allergies', () => {
             mainPage.getAllergyGrid().clickOnCell(0,'name');
						 NavigationService.checkPresentAndDisplayed(allergyDetailPage);

						 TestUtil.checkForm(getFormData(1), 'Allergy Management is correct');

						 FormService.removeValuesInForm(getFormData(), 'Allergy Management');

						 FormService.fillForm(getFormData(4), 'Allergy Creation to update previous one');
						 allergyDetailPage.getButtonSubmit().click();

						 NavigationService.checkPresentAndDisplayed(mainPage);
						 TestUtil.checkNumber(mainPage.getAllergyGrid().getNumberOfRows(), 'Rows in table of Allergies', 3);
				 });

		 it('Delete all elements recently added to the grid', () => {
				 const optionMenuDelete = 1;
				 for (let k = (browser.params.repeatabilityNumberPasses - 1); k >= 0; k--) {
						 allure.createStep(`Action: Delete the Allergy at the row #${k}`, () => {
                 mainPage.getAllergyGrid().clickOnRowMenu(0);
                 mainPage.getAllergyGrid().getMenu().selectOption(optionMenuDelete);
								 TestUtil.checkNumber(mainPage.getAllergyGrid().getNumberOfRows(), 'Number of Allergies', k);
						 })();
				 }
		 });

});
