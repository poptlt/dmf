<template>

    <center v-if="state == 'changing'">Установка начальной задолжности...</center>
    
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
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';
    
import Number from './Inputs/Number.vue';
    
export default {
    props: ["turnover", "balance", "FirmID", "ObjectID", "addPanel"],
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
        showDocument: function()
        {
            this.addPanel("Document", Name, {DocumentID: ID});
        }
    }
}
</script>