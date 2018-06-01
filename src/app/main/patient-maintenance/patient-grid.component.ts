import { AfterViewInit, Component } from '@angular/core';
import { I18nService } from 'systelab-translate/lib/i18n.service';
import { Patient } from '../../common/model/patient';
import { PatientService } from '../../common/api/patient.service';
import { AbstractGrid } from 'systelab-components/widgets/grid/abstract-grid.component';
import { DialogService } from 'systelab-components/widgets/modal/dialog/dialog.service';
import { PreferencesService } from 'systelab-preferences/lib/preferences.service';

@Component({
	selector: 'patient-grid',
	templateUrl: '../../../../node_modules/systelab-components/html/abstract-grid.component.html'
})
export class PatientGrid extends AbstractGrid<Patient> implements AfterViewInit {

	public values: Patient[] = [];

	constructor(protected preferencesService: PreferencesService, protected i18nService: I18nService, protected dialogService: DialogService, protected patientService: PatientService) {
		super(preferencesService, i18nService, dialogService);
	}

	public ngAfterViewInit() {
		this.refresh();
	}

	protected getColumnDefs(): Array<any> {
		const columnDefs: Array<any> = [];
		this.i18nService.get(['COMMON_NAME', 'COMMON_SURNAME', 'COMMON_MAIL']).subscribe((res) => {
			columnDefs.push(
				{ colId: 'name', headerName: res.COMMON_NAME, field: 'name', width: 300 },
				{ colId: 'surname', headerName: res.COMMON_SURNAME, field: 'surname', width: 300 },
				{ colId: 'email', headerName: res.COMMON_MAIL, field: 'email', width: 200 });
		});
		return columnDefs;
	}

	public refresh() {
		this.patientService.getAllPatients()
			.subscribe((results) => {
				this.values = results;
				this.gridOptions.api.setRowData(this.values);
			});
	}
}
