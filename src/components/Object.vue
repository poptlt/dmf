<template>
    <div>
        <b-card no-body>
            <b-card-header @click="collapse(propsID)">Реквизиты</b-card-header>
            <b-collapse :id="propsID" visible :accordion="accordionID">
                <b-card-body class="p-0">

                    <center v-if="!props" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

                    <div v-else-if="props.DMF_ERROR" class="alert alert-danger">{{ props.message }}</div>

                    <table v-else class="table table-hover">
                        <tbody>
                            <tr v-for="(item, ID) in props" @click="if(item.Editable) showHistory('Props', ID, item.PropName);">
                                <td>{{ item.PropName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>

                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card no-body>
            <b-card-header @click="collapse(calcParamsID)">Параметры расчетов</b-card-header>
            <b-collapse :id="calcParamsID" visible :accordion="accordionID">
                <b-card-body class="p-0">

                    <center v-if="!calcParams" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

                    <div v-else-if="calcParams.DMF_ERROR" class="alert alert-danger">{{ calcParams.message }}</div>

                    <table v-else class="table table-hover">
                        <tbody>
                            <tr v-for="(item, ID) in calcParams" @click="showHistory('CalcParams', ID, item.ParamName)">
                                <td>{{ item.ParamName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>

                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card v-if="ObjectType == 'Firm'" no-body>
            <b-card-header @click="collapse(tariffsID)">Тарифы</b-card-header>
            <b-collapse :id="tariffsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    
                    <Tariffs :tariffs="tariffs" :FirmID="FirmID" :addPanel="addPanel"/>

                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card v-if="ObjectType == 'Firm'" no-body>
            <b-card-header @click="collapse(bankAccountsID)">Расчётные счета</b-card-header>
            <b-collapse :id="bankAccountsID" visible :accordion="accordionID">
                <b-card-body class="p-0">

                    <center v-if="!bankAccounts" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

                    <div v-else-if="bankAccounts.DMF_ERROR" class="alert alert-danger">{{ bankAccounts.message }}</div>

                    <div v-else class="p-2">
                        <b-card v-for="account in bankAccounts" no-body>
                            <b-card-header @click="collapse(bankAccountsID+account.BankAccountID)">{{ account.BankAccountNumber }}</b-card-header>
                            <b-collapse :id="bankAccountsID+account.BankAccountID" visible :accordion="bankAccountsID+'accordion'">
                                <b-card-body class="p-0">
                                    <div>Неопознанные платежи:</div>
                                    <table class="table table-hover">
                                        <tbody>
                                            <tr v-for="payment in account.FailPayments" @click="showDocument(payment.DocID, '')">
                                                <td>
                                                    <div class="d-flex flex-wrap">
                                                        <div class="flex-grow-0 p-2">{{ payment.Date }}</div>
                                                        <div class="flex-grow-0 p-2">№ {{ payment.Number }}</div>
                                                        <div class="flex-grow-0 p-2">{{ payment.Summ }} руб.</div>
                                                        <div class="flex-grow-0 p-2">{{ payment.Text }}</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </b-card-body>
                            </b-collapse>
                        </b-card>
                    </div>

                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card v-if="ObjectType == 'LS'" no-body>
            <b-card-header @click="collapse(turnoverID)">Баланс</b-card-header>
            <b-collapse :id="turnoverID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    
                    <Turnover :turnover="turnover" :balance="balance" :FirmID="FirmID" :ObjectID="ObjectID" :addPanel="addPanel"/>
                    
                    <!--<center v-if="!turnover" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

                    <div v-else-if="turnover.DMF_ERROR" class="alert alert-danger">{{ turnover.message }}</div>
                    
                    <template v-else>
                        
                        <div v-if="root" class="p-2">Текущая задолжность: {{ root.Balance }}</div>
                        
                        <div class="d-flex align-items-center">
                            <div class="p-1">Начальная задолжность: </div>
                            <Number :NoNegative="false" :Digits="10" :DigitsAfterPoint="2" @change="changeStartBalance" class="m-1"/>
                            <div>
                                <button v-if="startBalance !== undefined" @click="writeStartBalance" class="btn btn-primary btn-sm">Установить</button>
                            </div>
                        </div>
                        
                        <table class="table table-hover">
                            <tbody>
                                <tr v-for="item in turnover" @click="showDocument(item.DocumentID, item.DocumentName)">
                                    <td>{{ item.Date }}</td>
                                    <td class="text-right" :class="{'text-success': (item.Type=='Credit'), 'text-danger': (item.Type=='Debit')}">{{ item.Sum }}</td>
                                    <td>{{ item.Comment }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </template>-->

                </b-card-body>
            </b-collapse>
        </b-card>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';
    
import Tariffs from './Tariffs.vue';
    
import Turnover from './Turnover.vue';

export default {
    props: ["FirmID", "ObjectID", "ObjectType", "addPanel"],
    components:
    {
        Tariffs, Turnover
    },
    data: function()
    {
        return {
            accordionID: this.randomID(),
            propsID: this.randomID(),
            calcParamsID: this.randomID(),
            tariffsID: this.randomID(),
            bankAccountsID: this.randomID(),
            turnoverID: this.randomID(),            
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            if(this.Objects && this.Objects[this.FirmID] && this.Objects[this.FirmID][this.ObjectID])
            {
                return this.Objects[this.FirmID][this.ObjectID];
            }
            else return null;
        },
        props: function()
        {
            if(this.root && this.root.Props) return this.root.Props;
            else
            {
                if(!this.root || this.root.Props === undefined) this.reload();

                return null;
            }
        },
        calcParams: function()
        {
            if(this.root && this.root.CalcParams) return this.root.CalcParams;
            else
            {
                if(!this.root || this.root.CalcParams === undefined) this.reload();

                return null;
            }
        },
        tariffs: function()
        {
            if(this.root && this.root.Tariffs) return this.root.Tariffs;
            else
            {
                if(!this.root || this.root.Tariffs === undefined) this.reload();

                return null;
            }
        },
        bankAccounts: function()
        {
            if(this.root && this.root.BankAccounts) return this.root.BankAccounts;
            else
            {
                if(!this.root || this.root.BankAccounts === undefined) this.reload();

                return null;
            }
        },
        turnover: function()
        {
            if(this.root && this.root.Turnover)
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
            }
        },
        balance: function()
        {
            console.log(this.root);
            
            if(this.root) return this.root.Balance;
            else return undefined;
        }
    },
    methods:
    {
        ...mapActions(['LOAD_OBJECT']),
        randomID: function()
        {
            return "id"+(""+Math.random()).substring(2);
        },
        collapse: function(ID)
        {
            this.$root.$emit('bv::toggle::collapse', ID);
        },
        reload: function()
        {
            this.LOAD_OBJECT({FirmID: this.FirmID, ObjectID: this.ObjectID, ObjectType: this.ObjectType, refresh: true});
        },
        showHistory: function(AttrType, AttrID, Name)
        {
            this.addPanel("History", this.Objects[this.FirmID][this.ObjectID].Name + ' ' + Name, {AttrType: AttrType, FirmID: this.FirmID, ObjectID: this.ObjectID, AttrID: AttrID});
        },
        showDocument: function(ID, Name)
        {
            this.addPanel("Document", Name, {DocumentID: ID});
        }
    }
}
</script>

<style>

</style>
