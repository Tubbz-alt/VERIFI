import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UtilityMeterGroupdbService } from 'src/app/indexedDB/utilityMeterGroup-db.service';
import { IdbFacility, IdbUtilityMeter, IdbUtilityMeterData, IdbUtilityMeterGroup } from 'src/app/models/idb';
import * as _ from 'lodash';
import { UtilityMeterDatadbService } from 'src/app/indexedDB/utilityMeterData-db.service';
import { UtilityMeterdbService } from 'src/app/indexedDB/utilityMeter-db.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FacilitydbService } from 'src/app/indexedDB/facility-db.service';

@Component({
  selector: 'app-meter-grouping',
  templateUrl: './meter-grouping.component.html',
  styleUrls: ['./meter-grouping.component.css']
})
export class MeterGroupingComponent implements OnInit {
  meterGroupTypes: Array<{
    meterGroups: Array<IdbUtilityMeterGroup>,
    groupType: string,
    id: string,
    meterGroupIds: Array<string>
  }>;

  groupMenuOpen: number;
  groupToEdit: IdbUtilityMeterGroup;
  groupToDelete: IdbUtilityMeterGroup;
  facilityMeterDataSub: Subscription;
  facilityMeterGroupsSub: Subscription;
  facilityMeters: Array<IdbUtilityMeter>;
  editOrAdd: string;
  facilityMetersSub: Subscription;
  constructor(private utilityMeterGroupDbService: UtilityMeterGroupdbService, private utilityMeterDataDbService: UtilityMeterDatadbService,
    private utilityMeterDbService: UtilityMeterdbService, private facilityDbService: FacilitydbService) { }

  ngOnInit(): void {
    this.facilityMeterGroupsSub = this.utilityMeterGroupDbService.facilityMeterGroups.subscribe(() => {
      if (this.facilityMeters) {
        this.setGroupTypes();
      }
    });

    this.facilityMeterDataSub = this.utilityMeterDataDbService.facilityMeterData.subscribe(() => {
      if (this.facilityMeters) {
        this.setGroupTypes();
      }
    });

    this.facilityMetersSub = this.utilityMeterDbService.facilityMeters.subscribe(val => {
      this.facilityMeters = val;
      if (this.facilityMeters) {
        this.setGroupTypes();
      }
    })
  }

  ngOnDestroy() {
    this.facilityMeterGroupsSub.unsubscribe();
    this.facilityMeterDataSub.unsubscribe();
    this.facilityMetersSub.unsubscribe();
  }

  setGroupTypes() {
    let meterGroups: Array<IdbUtilityMeterGroup> = this.utilityMeterGroupDbService.facilityMeterGroups.getValue();
    this.meterGroupTypes = _.chain(meterGroups).groupBy('groupType').map((value: Array<IdbUtilityMeterGroup>, key: string) => {
      let meterGroups: Array<IdbUtilityMeterGroup> = this.setGroupDataSummary(value)
      return {
        meterGroups: meterGroups,
        groupType: key,
        id: Math.random().toString(36).substr(2, 9),
        meterGroupIds: meterGroups.map(meterGroup => { return String(meterGroup.id) })
      }
    }).value();

    let meterGroupIds: Array<number> = meterGroups.map(meterGroup => { return meterGroup.id });
    //set no groups
    let metersWithoutGroups: Array<IdbUtilityMeter> = this.facilityMeters.filter(meter => { return !meterGroupIds.includes(meter.groupId) });
    //Energy (Electricity/Natural Gas)
    let energyMeters: Array<IdbUtilityMeter> = metersWithoutGroups.filter(meter => { return meter.source == 'Electricity' || meter.source == 'Natural Gas' || meter.source == 'Other Fuels' || meter.source == 'Other Energy' });
    if (energyMeters.length != 0) {
      this.addEnergyMetersWithoutGroups(energyMeters, 'Energy');
    }
    //Water/WasteWater
    let waterMeters: Array<IdbUtilityMeter> = metersWithoutGroups.filter(meter => { return meter.source == 'Water' || meter.source == 'Waste Water' });
    if (waterMeters.length != 0) {
      this.addEnergyMetersWithoutGroups(waterMeters, 'Water');
    }
    //Other
    let otherMeters: Array<IdbUtilityMeter> = metersWithoutGroups.filter(meter => { return meter.source == 'Other Utility' });
    if (otherMeters.length != 0) {
      this.addEnergyMetersWithoutGroups(otherMeters, 'Other');
    }
    for (let i = 0; i < this.meterGroupTypes.length; i++) {
      this.meterGroupTypes[i].meterGroups = this.setFractionOfTotalEnergy(this.meterGroupTypes[i].meterGroups);
    }
  }

  setGroupDataSummary(meterGroups: Array<IdbUtilityMeterGroup>): Array<IdbUtilityMeterGroup> {
    meterGroups.forEach(group => {
      let groupMeters: Array<IdbUtilityMeter> = this.facilityMeters.filter(meter => { return meter.groupId == group.id });
      let groupMeterIds: Array<number> = groupMeters.map(meter => { return meter.id });
      let groupMeterData: Array<IdbUtilityMeterData> = this.utilityMeterDataDbService.getMeterDataFromMeterIds(groupMeterIds);
      group.groupData = groupMeters;
      group.totalEnergyUse = _.sumBy(groupMeterData, 'totalEnergyUse');
    });
    return meterGroups;
  }

  addEnergyMetersWithoutGroups(energyMeters: Array<IdbUtilityMeter>, groupType: string) {
    let groupMeterIds: Array<number> = energyMeters.map(meter => { return meter.id });
    let groupMeterData: Array<IdbUtilityMeterData> = this.utilityMeterDataDbService.getMeterDataFromMeterIds(groupMeterIds);
    let meterGroup: IdbUtilityMeterGroup = {
      //randon number id for unsaved
      id: 1000000000000000 * Math.random(),
      facilityId: undefined,
      accountId: undefined,
      groupType: groupType,
      name: 'Ungrouped',
      description: 'Meters with no group',
      unit: undefined,
      dateModified: undefined,
      factionOfTotalEnergy: undefined,
      totalEnergyUse: _.sumBy(groupMeterData, 'totalEnergyUse'),
      groupData: energyMeters
    }
    let energyGroup: {
      meterGroups: Array<IdbUtilityMeterGroup>,
      groupType: string,
      id: string,
      meterGroupIds: Array<string>
    } = this.meterGroupTypes.find(meterGroup => { return meterGroup.groupType == groupType })
    if (energyGroup) {
      energyGroup.meterGroups.push(meterGroup);
      energyGroup.meterGroupIds.push(String(meterGroup.id));
    } else {
      this.meterGroupTypes.push({
        groupType: groupType,
        meterGroups: [meterGroup],
        id: Math.random().toString(36).substr(2, 9),
        meterGroupIds: [String(meterGroup.id)]
      });
    }
  }

  setFractionOfTotalEnergy(meterGroups: Array<IdbUtilityMeterGroup>): Array<IdbUtilityMeterGroup> {
    let totalGroupEnergyUse: number = _.sumBy(meterGroups, 'totalEnergyUse');
    meterGroups.forEach(group => {
      group.factionOfTotalEnergy = (group.totalEnergyUse / totalGroupEnergyUse) * 100;
    });
    return meterGroups
  }

  groupToggleMenu(groupId: number) {
    if (groupId != this.groupMenuOpen) {
      this.groupMenuOpen = groupId;
    } else {
      this.groupMenuOpen = undefined;
    }
  }

  setEditGroup(group: IdbUtilityMeterGroup) {
    this.editOrAdd = 'edit';
    this.groupToEdit = group;
  }

  setDeleteGroup(group: IdbUtilityMeterGroup) {
    let groupMeters: Array<IdbUtilityMeter> = this.facilityMeters.filter(meter => { return meter.groupId == group.id });
    // Check if group has data
    if (groupMeters.length != 0) {
      alert("Group must be empty before deleting.");
    } else {
      this.groupToDelete = group;
    }
  }

  closeEditGroup() {
    this.editOrAdd = undefined;
    this.groupToEdit = undefined;
    this.groupMenuOpen = undefined;
  }

  closeDeleteGroup() {
    this.groupToDelete = undefined;
    this.groupMenuOpen = undefined;
  }

  drop(event: CdkDragDrop<string[]>) {
    let draggedMeter: IdbUtilityMeter = this.facilityMeters.find(meter => { return meter.id == event.item.data.id });
    let newGroupId: number = Number(event.container.id);
    draggedMeter.groupId = newGroupId;
    this.setGroupTypes();
    this.utilityMeterDbService.update(draggedMeter);
  }

  groupAdd(groupType: string) {
    this.editOrAdd = 'add';
    let facility: IdbFacility = this.facilityDbService.selectedFacility.getValue();
    this.groupToEdit = this.utilityMeterGroupDbService.getNewIdbUtilityMeterGroup(groupType, '', 'New Group', facility.id, facility.accountId);
  }

  deleteMeterGroup() {
    this.utilityMeterGroupDbService.deleteIndex(this.groupToDelete.id);
    this.closeDeleteGroup();
  }
}