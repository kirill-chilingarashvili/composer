/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ClientService } from '../services/client.service';
import { SampleBusinessNetworkService } from '../services/samplebusinessnetwork.service';
import { AlertService } from '../basic-modals/alert.service';
import { ImportComponent } from './import.component';
import { ReplaceComponent } from '../basic-modals/replace-confirm';
import { ActiveDrawer } from '../common/drawer';

@Component({
    selector: 'update-business-network',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss'.toString()],
})
export class UpdateComponent extends ImportComponent {

    constructor(protected clientService: ClientService,
                protected modalService: NgbModal,
                protected sampleBusinessNetworkService: SampleBusinessNetworkService,
                protected alertService: AlertService,
                protected activeDrawer: ActiveDrawer) {
        super(clientService, modalService, sampleBusinessNetworkService, alertService);
    }

    onShow(): Promise<void> {
        this.networkName = this.clientService.getBusinessNetwork().getName();
        return super.onShow();
    }

    deploy() {
        let deployed: boolean = true;

        // close the draw as we no longer need it
        this.activeDrawer.close();
        const confirmModalRef = this.modalService.open(ReplaceComponent);
        confirmModalRef.componentInstance.mainMessage = 'Your Business Network Definition currently in the Playground will be removed & replaced.';
        confirmModalRef.componentInstance.supplementaryMessage = 'Please ensure that you have exported any current model files in the Playground.';
        confirmModalRef.componentInstance.resource = 'definition';
        return confirmModalRef.result.then((result) => {
            if (result === true) {
                this.deployInProgress = true;
                return this.sampleBusinessNetworkService.updateBusinessNetwork(this.currentBusinessNetwork);
            } else {
                deployed = false;
            }
        })
            .then(() => {
                this.deployInProgress = false;
                this.finishedSampleImport.emit({deployed: deployed});
            })
            .catch((error) => {
                this.deployInProgress = false;
                this.alertService.errorStatus$.next(error);
                this.finishedSampleImport.emit({deployed: false, error: error});
            });
    }

    cancel() {
        this.finishedSampleImport.emit({deployed: false});
    }
}
