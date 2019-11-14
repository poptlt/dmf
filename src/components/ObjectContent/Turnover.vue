<template>

    <!--<center v-if="state == 'changing'">Установка начальной задолжности...</center>

    <div v-else>
        <template v-if="turnover !== undefined">

            <center v-if="!turnover" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

            <div v-else-if="turnover.DMF_ERROR" class="alert alert-danger">{{ turnover.message }}</div>

            <template v-else>

                <div v-if="balance !== undefined && balance !== null" class="p-2">Текущая задолжность: {{ balance }}</div>

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

            </template>

        </template>
    </div>-->

<State ref="state">
    
    <div class="d-flex align-items-center">
        <div class="p-1">Начальная задолжность: </div>
        <Number :NoNegative="false" :Digits="10" :DigitsAfterPoint="2" @change="changeStartBalance" class="m-1"/>
        <div>
            <button v-if="startBalance !== undefined" @click="writeStartBalance" class="btn btn-primary btn-sm">Установить</button>
        </div>
    </div>
    
    <center>
        <button class="btn btn-primary" @click="newDoc">
            Новый документ
        </button>
    </center>

    <div class="d-flex align-items-center justify-content-around">

        <button @click="year-=1"
                class="btn btn-link">
            <font-awesome-icon icon="caret-left"/>
        </button>

        <div class="flex-grow-0">{{ year }}</div>

        <button @click="year+=1"
                class="btn btn-link">
            <font-awesome-icon icon="caret-right"/>
        </button>

    </div>
    <template v-if="isData([data])">


        <div class="m-2">Начальное сальдо: {{ data.BeginSaldo }}</div>

        <table class="table table-hover">
            <tr v-for="item in data.Moving"
                @click="(item.Doc) ? showDoc(item.Doc) : null"
                :style="{'background-color': item.Type ? '#ffcccc' : '#ccffcc'}">
                <td>{{ dateForClient(new Date(Date.parse(item.Date)), 'day') }}</td>
                <td>{{ item.Summ }}</td>
                <td>{{ item.Text }}</td>
            </tr>
        </table>

        <div class="m-2">Конечное сальдо: {{ data.EndSaldo }}</div>

    </template>
    <NoData v-else :data="[data]"/>
        
</State>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import NoData from '../NoData.vue';
    
import State from '../State.vue';
    
import Number from '../Inputs/Number.vue';

export default {
    props: ["FirmID", "LSID", "addPanel"],
    components:
    {
        NoData, State, Number
    },
    data: function()
    {
        return {
            year: (new Date()).getFullYear(),
            startBalance: undefined
        }
    },
    computed:
    {
        data: function()
        {
            console.log(this.vuexLoad({
                data: {func: "GetLSTurnover", FirmID: this.FirmID, LSID: this.LSID, year: this.year}
            }).data);
            
            return this.vuexLoad({
                data: {func: "GetLSTurnover", FirmID: this.FirmID, LSID: this.LSID, year: this.year}
            }).data;
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        showDoc: function({DocID = undefined, Name, Type, Object})
        {
            if(DocID)
            {
                if(Type == "LSBalanceChange")
                {
                    this.addPanel("EditableDocument", Name, {DocumentID: DocID, FirmID: Object.FirmID, ObjectID: Object.ObjectID, type: "LSBalanceChange"});
                }
                else if(Type == "BankPayment")
                {
                    this.addPanel("BankPayment", Name, {DocumentID: DocID, FirmID: Object.FirmID, ObjectID: Object.ObjectID});
                }
                else
                {
                    this.addPanel("Document", Name, {DocumentID: DocID, FirmID: Object.FirmID, ObjectID: Object.ObjectID});
                }
            }
        },
        newDoc: function()
        {
            this.addPanel("EditableDocument", "Новый документ", {DocumentID: "", FirmID: this.FirmID, ObjectID: this.LSID, type: "LSBalanceChange"});
        },
        changeStartBalance: function(val)
        {
            this.startBalance = val;
        },
        writeStartBalance: function()
        {            
            let change = this.$refs.state.change;
            
            function accepted()
            {
                change("show");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при установке начальной задолжности: " + message);
            }
            
            change("changing", "Установка начальной задолжности");
            
            this.SEND_DATA({
                query: {
                    func: "SetLSBalance",
                    FirmID: this.FirmID,
                    LSID: this.LSID,
                    value: this.startBalance
                },
                accepted: accepted,
                rejected: rejected
            });
        },
    }
    
    /*props: ["turnover", "balance", "FirmID", "ObjectID", "addPanel"],
    components:
    {
        Number
    },
    data: function()
    {
        return {

            startBalance: undefined,
            state: "show"
        }
    },
    methods:
    {
        ...mapActions(["WRITE_START_BALANCE"]),
        changeStartBalance: function(val)
        {
            this.startBalance = val;
        },
        writeStartBalance: function()
        {
            let th = this;

            function done(message)
            {
                th.state = "done";

                if(message) console.log(message);
            }

            this.state = "changing";

            this.WRITE_START_BALANCE({FirmID: this.FirmID, ObjectID: this.ObjectID, value: this.startBalance, accepted: done, rejected: done});
        },
        showDocument: function(ID, Name)
        {
            this.addPanel("Document", Name, {DocumentID: ID});
        }
    }*/
}
</script>
