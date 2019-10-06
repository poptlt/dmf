<template>
<div>
    <div v-if="Type == 'LS'" class="d-flex align-items-center">
        <button @click="getUrl" class="flex-grow-0 border btn btn-light btn-sm m-2">Получить url</button>
        <div>{{ urlMessage }}</div>
        <div hidden ref="link">link</div>
    </div>

    <Tab :accordionID="accordionID" :visible="true" label="Реквизиты">

        <template v-if="isData([props, tariffTOState, equipmentState])">

            <table class="table table-hover">
                <tbody>
                    <tr v-for="item in props" @click="(item.Editable) ? showHistory('Props', item.PropID, item.PropName) : false">
                        <td>{{ item.PropName }}</td>
                        <td>{{ item.Value }}</td>
                    </tr>
                </tbody>
            </table>


            <div class="d-flex justify-content-between align-items-center">

                <div class="text-center font-weight-bold">Тарифы</div>
                <button @click="showTariffTOHistory"
                        class="border btn btn-light btn-sm m-1 flex-grow-0">
                    История
                </button>

            </div>
            <TariffTOState :data="tariffTOState"/>


            <div class="d-flex justify-content-between align-items-center">

                <div class="text-center font-weight-bold">Оборудование</div>
                <button @click="showEquipmentHistory"
                        class="border btn btn-light btn-sm m-1 flex-grow-0">
                    История
                </button>

            </div>
            <EquipmentState :data="equipmentState"/>

        </template>
        <NoData v-else :data="[props, tariffTOState, equipmentState]"/>

    </Tab>

    <Tab :accordionID="accordionID" label="Параметры расчетов">

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

        <BankAccounts v-if="isData([bankAccounts])"
                      :data="bankAccounts"
                      :FirmID="FirmID"
                      :addPanel="addPanel"/>
        <NoData v-else :data="[bankAccounts]"/>

    </Tab>

    <Tab v-if="Type == 'LS'" :accordionID="accordionID" label="Баланс">

        пока не готов

        <!--<Turnover :turnover="turnover" :balance="balance" :FirmID="FirmID" :ObjectID="ObjectID" :addPanel="addPanel"/>-->

    </Tab>

    <Tab :accordionID="accordionID" label="Начисления">

        <Calculation :FirmID="FirmID" :ObjectID="ObjectID"/>

    </Tab>

    <Tab :accordionID="accordionID" label="Квитанция">

        <Receipt :FirmID="FirmID" :ObjectID="ObjectID"/>

    </Tab>
</div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import State from './State.vue';
    
import NoData from './NoData.vue';
    
import Tab from './ObjectContent/Tab.vue';

    
import TariffTOState from './ObjectContent/TariffTOState.vue';

import EquipmentState from './ObjectContent/EquipmentState.vue';
    
import Tariffs from './ObjectContent/Tariffs.vue';
    
import TariffsTO from './ObjectContent/TariffsTO.vue';

import BankAccounts from './ObjectContent/BankAccounts.vue';

//import Turnover from './ObjectContent/Turnover.vue';

import Calculation from './ObjectContent/Calculation.vue';

import Receipt from './ObjectContent/Receipt.vue';

export default {
    props: ["FirmID", "ObjectID", "Name", "Type",
            "props", "calcParams", "tariffTOState", "equipmentState", "tariffs", "tariffsTO", "bankAccounts",
            "addPanel"],
    components:
    {
        NoData, State, Tab,
        TariffTOState, EquipmentState, Tariffs, TariffsTO, BankAccounts, Calculation, Receipt
    },
    data: function()
    {
        return {
            accordionID: "id"+(""+Math.random()).substring(2),

            urlMessage: "",
        }
    },
    /*computed:
    {
        queries: function()
        {
            let res = {
                props: {func: "GetObjectProps", FirmID: this.FirmID, ObjectID: this.ObjectID},

                calcParams: {func: "GetObjectCalcParams", FirmID: this.FirmID, ObjectID: this.ObjectID},

                tariffsTO: {func: "GetTariffsTO", FirmID: this.FirmID},

                tariffTOState: {func: "ObjectTariffTOState", FirmID: this.FirmID, ObjectID: this.ObjectID},

                equipmentState: {func: "ObjectHardState", FirmID: this.FirmID, ObjectID: this.ObjectID}
            };

            if(this.ObjectType == "Firm")
            {
                res.tariffs = {func: "GetTariffs", FirmID: this.FirmID};

                res.bankAccounts = {func: "GetBankAccounts", FirmID: this.FirmID};

                res.hardTypes = {func: "GetHardTypes"};
            }

            return res;
        }
    },*/
    methods:
    {
        ...mapActions(["GET_URL"]),
        showHistory: function(AttrType, AttrID, Name)
        {
            //let label = this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "name") + " " + Name;

            this.addPanel("History", this.Name + " " + Name, {AttrType: AttrType, FirmID: this.FirmID, ObjectID: this.ObjectID, AttrID: AttrID});
        },
        showTariffTOHistory: function()
        {
            this.addPanel("ObjectTariffTOHistory", this.Name + " Тарифы ТО", {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showEquipmentHistory: function()
        {
            this.addPanel("EquipmentHistory", this.Name + " Оборудование", {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showCalcParams: function()
        {
            this.addPanel("CalcParams", this.Name + ": Параметры расчета дочерних", {FirmID: this.FirmID, ObjectID: this.ObjectID});
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
