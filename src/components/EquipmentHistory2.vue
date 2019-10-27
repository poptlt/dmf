<template>
<div>
    <div v-for="period in periods">
        <center class="font-weight-bold">
            {{ period.date }}
        </center>
        <ul>
        <li v-for="action in period.actions">
            
            <template v-if="action.type == 'tariff'">
                Установка тарифа {{ action.name }}
            </template>
            
            <template v-if="action.type == 'hard'">
                Монтаж оборудования {{ action.name }}
            </template>

            <template v-if="action.type == 'remove'">
                Демонтаж оборудования на комплекте {{ action.name }}
            </template>

            <template v-if="action.type == 'state'">
                {{ action.value ? 'Включение' : 'Выключение' }}
                оборудования на комлекте 
                {{ action.name }}
            </template>

            <template v-if="action.object">
                 на <a href="#" @click="showObject(action.object)">
                        {{ action.object.Name }}
                    </a>
            </template>
        </li>
        </ul>
        
        <table class="table ml-4">
            <tr v-for="equipment in period.equipment"
                :style="{'background-color': (equipment.state) ? '#ccffcc' : '#ffcccc'}">
                <td class="py-1">{{ equipment.name }}</td>
                <td class="py-1">{{ equipment.value }}</td>
            </tr>
        </table>
    </div>
</div>
</template>

<script>

import { mapActions } from 'vuex';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID", "history", "kits", "showObject"],
    components:
    {
        Datepicker
    },
    data: function()
    {
        console.log(this.history);
        
        let res = {periods: [], ru: ru};
        
        let price = {}, hard = {}, state = {};
        
        for(let kitID in this.kits)
        {
            hard[kitID] = "-";
            
            for(let equipmentID in this.kits[kitID].List) price[equipmentID] = "-";
        }
        
        let i = 0;
        
        while(i < this.history.length)
        {
            let date = this.history[i].Date, tariffs = {};
            
            let period = {
                date: this.dateForClient(new Date(Date.parse(date)), "day"),
                actions: [],
                equipment: []
            };
            
            while(i < this.history.length && this.history[i].Date == date)
            {
                let item = this.history[i], object = undefined;
                
                if(item.Object.ObjectID != this.ObjectID) object = item.Object;
                                
                if(item.Comment == "tariff")
                {
                    if(tariffs[item.TariffID] === undefined)
                    {
                        period.actions.push({
                            type: "tariff",
                            name: item.TariffName,
                            object: object
                        });
                        
                        tariffs[item.TariffID] = true;
                    }
                    
                    price[item.TypeID] = item.TariffValue;
                }
                if(item.Comment == "hard")
                {
                    if(item.TypeID != "-")
                    {
                        period.actions.push({
                            type: "hard",
                            name: item.TypeName,
                            object: object
                        });
                    }
                    else
                    {
                        period.actions.push({
                            type: "remove",
                            name: item.ComplectName,
                            object: object
                        });
                    }
                    
                    hard[item.ComplectID] = item.TypeID;
                    state[item.ComplectID] = true;
                }
                if(item.Comment == "work")
                {
                    period.actions.push({
                        type: "state",
                        name: item.ComplectName,
                        value: item.WorkState,
                        object: object
                    });
                    
                    state[item.ComplectID] = item.WorkState;
                }
                
                
                i++;
            }
            
            for(let kitID in hard)
            {
                let equipmentID = hard[kitID];
                
                if(equipmentID != "-")
                {
                    period.equipment.push({
                        name: this.kits[kitID].List[equipmentID],
                        value: price[equipmentID],
                        state: state[kitID]
                    });
                }
            }
            
            res.periods.push(period);
        }
        
        console.log(res);
        
        return res;
    }
}
</script>