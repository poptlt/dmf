<template>
<div>
    <div v-if="Type == 'LS' && showFor(Roles, 'FirmAdmin', 'FirmAdminTest', 'AddFirmAdmin')"
         class="d-flex align-items-center">
        <button @click="getUrl" class="flex-grow-0 border btn btn-light btn-sm m-2">Получить url</button>
        <div>{{ urlMessage }}</div>
        <div hidden ref="link">link</div>
    </div>

    <Tab :accordionID="accordionID" :visible="true" label="Реквизиты">

        <table v-if="isData([props])"
               class="table table-hover">
            <tbody>
                <tr v-for="item in props" @click="(item.Editable) ? showHistory('Props', item.PropID, item.PropName) : false">
                    <td>{{ item.PropName }}</td>
                    <td>{{ item.Value }}</td>
                </tr>
            </tbody>
        </table>
        <NoData v-else :data="[props]"/>

        <template v-if="showFor(Roles, 'FirmAdmin', 'FirmAdminTest', 'AddFirmAdmin')">
                        
            <div class="d-flex justify-content-between align-items-center">

                <div class="text-center font-weight-bold">Состояние оборудования и тарифов ТО</div>
                <button @click="showEquipmentHistory"
                        class="border btn btn-light btn-sm m-1 flex-grow-0">
                    <font-awesome-icon icon="edit"/>
                </button>

                <button @click="showEquipmentHistory2"
                        class="border btn btn-light btn-sm m-1 flex-grow-0">
                    2
                </button>
            </div>
            
            <!--<table v-if="isData([equipmentState])"
                   class="table">
                <template v-for="(equipment, i) in equipmentState">
                    <tr :style="{'background-color': (equipment.HardState) ? ((equipment.WorkState ? '#ccffcc' : '#ffcccc')) : 'WhiteSmoke'}">
                        <td>{{ equipment.TypeName }}</td>
                        <td>{{ equipment.TariffValue }}</td>
                        <td class="px-0">
                            <button @click="showEquipmentInfo(i)"
                                    class="btn btn-link btn-sm">
                                <font-awesome-icon :icon="(equipmentInfo[i]) ? 'chevron-up' : 'chevron-down'"/>
                            </button>
                        </td>
                    </tr>
                    <tr v-show="equipmentInfo[i]">
                        <td colspan="3" class="p-1">
                            <div v-if="equipment.HardDetails"
                                 class="p-2">
                                Установлено {{ dateForClient(equipment.HardDetails.Date, 'day') }}
                                
                                <span v-if="equipment.HardDetails.Object.ObjectID != ObjectID">
                                    на
                                    <a href="#"
                                       @click="showObject(equipment.HardDetails.Object)">
                                        {{ equipment.HardDetails.Object.Name }}
                                    </a>
                                </span>
                            </div>
                            
                            <div v-if="equipment.TariffDetails"
                                 class="p-2">
                                {{ dateForClient(equipment.TariffDetails.Date, 'day') }} установлен тариф
                                <a href="#"
                                   @click="showTariffTO(equipment.TariffDetails)">
                                    {{ equipment.TariffDetails.TariffName }}
                                </a>
                                <span v-if="equipment.TariffDetails.Object.ObjectID != ObjectID">
                                    на
                                    <a href="#"
                                       @click="showObject(equipment.TariffDetails.Object)">
                                        {{ equipment.TariffDetails.Object.Name }}
                                    </a>
                                </span>
                            </div>
                            
                            <div v-if="equipment.WorkDetails"
                                 class="p-2">
                                {{ equipment.WorkState ? 'Включено' : 'Выключено' }}
                                {{ dateForClient(equipment.WorkDetails.Date, 'day') }}
                                <span v-if="equipment.WorkDetails.Object.ObjectID != ObjectID">
                                    на
                                    <a href="#"
                                       @click="showObject(equipment.WorkDetails.Object)">
                                        {{ equipment.WorkDetails.Object.Name }}
                                    </a>
                                </span>
                            </div>
                        </td>
                    </tr>
                </template>
            </table>
            <NoData v-else :data="[props, equipmentState]"/>-->

            <EquipmentState v-if="isData([equipmentState2, tariffsTO])"
                            :editable="true"
                            :data="equipmentState2"
                            :FirmID="FirmID"
                            :ObjectID="ObjectID"
                            :tariffs="tariffsTO"/>
            <NoData v-else :data="[equipmentState2, tariffsTO]"/>

        </template>

    </Tab>

    <Tab v-if="showFor(Roles, 'FirmAdmin', 'FirmAdminTest', 'AddFirmAdmin')"
         :accordionID="accordionID" label="Параметры расчетов">

        <template v-if="isData([calcParams])">

            <center><button @click="showCalcParams" class="border btn btn-light btn-sm m-2">Информация по дочерним</button></center>

            <table class="table table-hover">
                <tbody>
                    <tr v-for="item in calcParams" @click="showHistory('CalcParams', item.ParamID, item.ParamName)">
                        <td>{{ item.ParamName }}</td>
                        <td>{{ item.Value }}</td>
                    </tr>
                </tbody>
            </table>

        </template>
        <NoData v-else :data="[calcParams]"/>

    </Tab>


    <Tab v-if="Type == 'Firm'" :accordionID="accordionID" label="Список тарифов">

        <State>
            <Tariffs v-if="isData([tariffs])"
                     :tariffs="tariffs"
                     :FirmID="FirmID"
                     :FirmName="Name"
                     :addPanel="addPanel"/>
            <NoData v-else :data="[tariffs]"/>
        </State>

    </Tab>

    <Tab v-if="Type == 'Firm'" :accordionID="accordionID" label="Список тарифов ТО">

        <State>
            <TariffsTO v-if="isData([tariffsTO])"
                       :data="tariffsTO"
                       :FirmID="FirmID"
                       :FirmName="Name"
                       :addPanel="addPanel"/>
            <NoData v-else :data="[tariffsTO]"/>
        </State>

    </Tab>

    <Tab v-if="Type == 'Firm'" :accordionID="accordionID" label="Расчётные счета">
        
        <center>
            <button @click="loadPaymentFile"
                    class="border btn btn-light btn-sm m-2">
                Загрузить платежи из файла
            </button>
        </center>
        
        <div v-if="isData([bankAccounts])" class="m-2">
            <Tab v-for="(account, i) in bankAccounts"
                 :accordionID="accountsAccordionID"
                 :label="account.BankAccountName"
                 :visible="i==0">
                <BankAccount :ID="account.BankAccountID"
                             :FirmID="FirmID"
                             :data="account"
                             :addPanel="addPanel"/>
            </Tab>
        </div>
        <NoData v-else :data="[bankAccounts]"/>

    </Tab>

    <Tab v-if="Type == 'LS'" :accordionID="accordionID" label="Баланс">

        <Turnover :FirmID="FirmID"
                  :LSID="ObjectID"
                  :Roles="Roles"
                  :addPanel="addPanel"/>

    </Tab>

    <Tab v-if="showFor(Roles, 'FirmAdmin', 'FirmAdminTest', 'AddFirmAdmin')"
         :accordionID="accordionID" label="Начисления">

        <Calculation :FirmID="FirmID" :ObjectID="ObjectID"/>

    </Tab>

    <Tab v-if="showFor(Roles, 'FirmAdmin', 'FirmAdminTest', 'AddFirmAdmin')"
         :accordionID="accordionID" label="Квитанция">

        <Receipt :FirmID="FirmID" :ObjectID="ObjectID"/>

    </Tab>
</div>
</template>

<script>

import Vue from 'vue';
    
import { mapActions, mapState } from 'vuex';

import State from './State.vue';
    
import NoData from './NoData.vue';
    
import Tab from './ObjectContent/Tab.vue';


import EquipmentState from './EquipmentState.vue';
    
import Tariffs from './ObjectContent/Tariffs.vue';
    
import TariffsTO from './ObjectContent/TariffsTO.vue';

import BankAccount from './ObjectContent/BankAccount.vue';

import Turnover from './ObjectContent/Turnover.vue';

import Calculation from './ObjectContent/Calculation.vue';

import Receipt from './ObjectContent/Receipt.vue';

export default {
    props: ["FirmID", "ObjectID", "Name", "Type", "Roles",
            "props", "calcParams", "equipmentState", "equipmentState2", "tariffs", "tariffsTO", "bankAccounts",
            "addPanel", "showObject"],
    components:
    {
        NoData, State, Tab,
        EquipmentState, Tariffs, TariffsTO, BankAccount, Turnover, Calculation, Receipt
    },
    data: function()
    {
        //console.log(this.$refs.equipmentState);

        return {
            equipmentInfo: [],
            
            accordionID: "id"+(""+Math.random()).substring(2),
            
            accountsAccordionID: "id"+(""+Math.random()).substring(2),

            urlMessage: "",
        }
    },
    methods:
    {
        ...mapActions(["GET_URL"]),

        showEquipmentInfo: function(i)
        {
            Vue.set(this.equipmentInfo, i, (this.equipmentInfo[i]) ? false : true);
        },
        showHistory: function(AttrType, AttrID, Name)
        {
            this.addPanel("History", this.Name + " " + Name, {AttrType: AttrType, FirmID: this.FirmID, ObjectID: this.ObjectID, AttrID: AttrID});
        },
        showTariffTO: function({TariffID, TariffName, TariffObject})
        {
            this.addPanel("TariffsTOHistory", TariffObject.Name + " " + TariffName, {FirmID: this.FirmID, TariffID: TariffID});
        },
        showEquipmentHistory: function()
        {
            this.addPanel("EquipmentHistory", this.Name + ", оборудование и тарифы", {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showEquipmentHistory2: function()
        {
            this.addPanel("EquipmentHistory2", this.Name + ", оборудование и тарифы", {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showCalcParams: function()
        {
            this.addPanel("CalcParams", this.Name + ": Параметры расчета дочерних", {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        loadPaymentFile: function()
        {
            this.addPanel("PaymentFile", "Загрузить платежи из файла", {});
        },
        getUrl: function()
        {
            this.urlMessage = "Получение URL...";

            let th = this;

            function accepted(url)
            {
                th.urlMessage = "URL скопирован в буфер";

                var range = document.createRange(),
                selection = window.getSelection();

                selection.removeAllRanges();

                let link = th.$refs.link;

                link.innerHTML = url;

                link.hidden = false;

                range.selectNodeContents(link);

                selection.addRange(range);

                document.execCommand('copy');

                link.hidden=true;

                selection.removeAllRanges();
            }

            function rejected(message)
            {
                th.urlMessage = "Произошла ошибка: " + message;
            }

            this.GET_URL({ID: this.ObjectID, accepted: accepted, rejected: rejected});
        }
    }
}
</script>

/*
роли:

тестовый админ - разраб,

админ - владелец

помощник админа - назначается админом,

владелец лс - назначается системой

<style>

</style>
