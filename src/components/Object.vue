<template>

    <div>
        <div v-if="ObjectType == 'LS'" class="d-flex align-items-center">
            <button @click="getUrl" class="flex-grow-0 border btn btn-light btn-sm m-2">Получить url</button>
            <div>{{ urlMessage }}</div>
            <div hidden ref="link">link</div>
        </div>

        <Tab :accordionID="accordionID" :visible="true" label="Реквизиты">

            <template v-if="isData([dataPack.props, dataPack.tariffTOState, dataPack.equipmentState])">

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
                <TariffTOState :data="dataPack.tariffTOState"/>


                <div class="d-flex justify-content-between align-items-center">

                    <div class="text-center font-weight-bold">Оборудование</div>
                    <button @click="showEquipmentHistory"
                            class="border btn btn-light btn-sm m-1 flex-grow-0">
                        История
                    </button>

                </div>
                <EquipmentState :data="dataPack.equipmentState"/>

            </template>
            <NoData v-else :data="[dataPack.props, dataPack.tariffTOState, dataPack.equipmentState]"/>

        </Tab>

        <Tab :accordionID="accordionID" label="Параметры расчетов">

            <center v-if="!calcParams" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

            <div v-else-if="calcParams.DMF_ERROR" class="alert alert-danger">{{ calcParams.message }}</div>

            <template v-else>
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

        </Tab>

        <!--<Tab :accordionID="accordionID" label="Тарифы ТО">

            <TariffTOHistory :FirmID="FirmID"
                             :ObjectID="ObjectID"
                             :history="dataPack.tariffTOHistory"
                             :tariffs="dataPack.tariffsTO"/>
        </Tab>-->

        <Tab v-if="ObjectType == 'Firm'" :accordionID="accordionID" label="Список тарифов">

            <Tariffs :tariffs="tariffs" :FirmID="FirmID" :addPanel="addPanel"/>

        </Tab>

        <Tab v-if="ObjectType == 'Firm'" :accordionID="accordionID" label="Список тарифов ТО">

            <TariffsTO :data="tariffsTO" :types="hardTypes" :FirmID="FirmID" :addPanel="addPanel"/>

        </Tab>

        <Tab v-if="ObjectType == 'Firm'" :accordionID="accordionID" label="Расчётные счета">

            <BankAccounts :data="bankAccounts" :FirmID="FirmID" :addPanel="addPanel"/>

        </Tab>

        <Tab v-if="ObjectType == 'LS'" :accordionID="accordionID" label="Баланс">

            <Turnover :turnover="turnover" :balance="balance" :FirmID="FirmID" :ObjectID="ObjectID" :addPanel="addPanel"/>

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

import NoData from './NoData.vue';
    
import Tab from './ObjectContent/Tab.vue';
    
import TariffTOState from './ObjectContent/TariffTOState.vue';

import EquipmentState from './ObjectContent/EquipmentState.vue';

//import TariffTOHistory from './ObjectContent/TariffTOHistory.vue';
    
import Tariffs from './ObjectContent/Tariffs.vue';
    
import TariffsTO from './ObjectContent/TariffsTO.vue';

import BankAccounts from './ObjectContent/BankAccounts.vue';

import Turnover from './ObjectContent/Turnover.vue';

import Calculation from './ObjectContent/Calculation.vue';

import Receipt from './ObjectContent/Receipt.vue';

export default {
    props: ["FirmID", "ObjectID", "addPanel"],
    components:
    {
        NoData, Tab, TariffTOState, EquipmentState, Tariffs, TariffsTO, BankAccounts, Turnover, Calculation, Receipt
    },
    data: function()
    {
        return {
            accordionID: "id"+(""+Math.random()).substring(2),

            urlMessage: "",
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        /*root: function()
        {
            if(this.Objects && this.Objects[this.FirmID] && this.Objects[this.FirmID][this.ObjectID])
            {
                return this.Objects[this.FirmID][this.ObjectID];
            }
            else return null;
        },*/
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
        },
        ObjectType: function()
        {
            return this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "Type");
        },
        dataPack: function()
        {
            return this.vuexLoad(this.queries);
        },
        props: function()
        {
            return this.vuexLoad(this.queries).props;
        },
        calcParams: function()
        {
            return this.vuexLoad(this.queries).calcParams;
        },
        tariffs: function()
        {
            return this.vuexLoad(this.queries).tariffs;
        },
        tariffsTO: function()
        {
            return this.vuexLoad(this.queries).tariffsTO;
        },
        hardTypes: function()
        {
            return this.vuexLoad(this.queries).hardTypes;
        },
        bankAccounts: function()
        {
            /*if(this.root && this.root.BankAccounts)
            {
                let res = this.root.BankAccounts;

                if(res.length) this.accordion2 = res[0].BankAccountID;

                return res;
            }
            else
            {
                if(!this.root || this.root.BankAccounts === undefined) this.reload();

                return null;
            }*/

            return this.vuexLoad(this.queries).bankAccounts;
        },
        turnover: function()
        {
            /*let turnover = this.vuexLoad(this.queries).data.turnover;

            if(!turnover) return turnover;

            let res = [];

            turnover.forEach((item) => {

                let t = {};
                for(let key in item) t[key] = item[key];

                t.Date = this.dateForClient(new Date(Date.parse(t.Date)), "day");

                res.push(t);
            });

            return res;*/

            return null;

            /*if(this.root && this.root.Turnover)
            {
                if(this.root.Turnover.DMF_ERROR) return this.root.Turnover;
                
                let res = [];
                
                this.root.Turnover.forEach((item) => {
                    
                    let t = {};
                    for(let key in item) t[key] = item[key];
                                        
                    t.Date = this.dateForClient(new Date(Date.parse(t.Date)), "day");
                    
                    res.push(t);
                });
                
                return res;
            }
            else
            {
                if(!this.root || this.root.Turnover === undefined) this.reload();

                return null;
            }*/
        },
        balance: function()
        {            
            /*if(this.root) return this.root.Balance;
            else return undefined;*/

            /*let data = this.vuexLoad(this.queries).data.balance;

            if(!data) return data;
            else return data.balance;*/

            return null;
        }
    },
    methods:
    {
        ...mapActions(["GET_URL"]),
        reload: function()
        {
            this.vuexClear(this.queries);
        },
        showHistory: function(AttrType, AttrID, Name)
        {
            let label = this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "name") + " " + Name;

            this.addPanel("History", label, {AttrType: AttrType, FirmID: this.FirmID, ObjectID: this.ObjectID, AttrID: AttrID});
        },
        showTariffTOHistory: function()
        {
            let label = this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "name") + " Тарифы ТО";

            this.addPanel("ObjectTariffTOHistory", label, {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showEquipmentHistory: function()
        {
            let label = this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "name") + " Оборудование";

            this.addPanel("EquipmentHistory", label, {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showCalcParams: function()
        {
            let label = this.vuexGet("Objects", this.FirmID, this.ObjectID, "info", "name"); + ': Параметры расчета дочерних';

            this.addPanel("CalcParams", label, {FirmID: this.FirmID, ObjectID: this.ObjectID});
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
