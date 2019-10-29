<template>

    <div style="height: 100%" class="d-flex flex-column">
        <div class="flex-grow-0 d-flex align-items-start bg-primary">
            <div class="p-1 text-light" style="font-size: 18px">{{ header }}</div>
            <button @click="reload" class="flex-grow-0 m-1 bg-light btn btn-outline-primary btn-sm">
                <font-awesome-icon icon="sync-alt" fixed-width/>
            </button>
            <button v-if="!main" @click="remove" class="flex-grow-0 m-1 bg-light btn btn-outline-primary btn-sm">
                <font-awesome-icon icon="times" fixed-width/>
            </button>
        </div>
        <div style="overflow: auto" class="pb-3">
            
            <Object v-if="type == 'Object'"
                    v-bind="combine(info, vuexLoad(queries))"
                    :addPanel="addPanel"
                    :showObject="showObject"/>
            
            <State v-else ref="state">
                
                <component :is="type"
                           ref="content"
                           v-if="isData(vuexLoad(queries))"
                           v-bind="combine(info, vuexLoad(queries))"
                           :addPanel="addPanel"
                           :showObject="showObject"
                           :setHeader="setHeader"/>
                    
                <NoData v-else :data="vuexLoad(queries)"/>
                    
            </State>
            
        </div>
    </div>

</template>

<script>

import State from './State.vue';

import NoData from './NoData.vue';
    
    
import Tree from './Tree.vue'

import LSList from './LSList.vue'

import Object from './Object.vue'
    
import History from './History.vue'
    
import TariffsTOHistory from './TariffsTOHistory.vue'

import Document from './Document.vue'

import CalcParams from './CalcParams.vue'

import ObjectTariffTOHistory from './ObjectTariffTOHistory.vue'

import EquipmentHistory from './EquipmentHistory.vue'
    
import EquipmentHistory2 from './EquipmentHistory2.vue'

import { mapState, mapMutations } from 'vuex';

export default {
    components:
    {
        State, NoData,
        
        Tree, LSList, Object, History, TariffsTOHistory, Document, CalcParams, ObjectTariffTOHistory, EquipmentHistory, EquipmentHistory2
    },
    props:
    {
        main:
        {
            type: Boolean,
            default: false
        },
        type:
        {
            type: String,
            default: "Tree"
        },
        label:
        {
            type: String,
            default: ""
        },
        info: {},
        addPanel: {},
        showObject: {}

    },
    data: function()
    {
        return {
            header: this.label
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        queries: function()
        {
            let info = this.info;
            
            let res;
            
            switch(this.type)
            {
                case "Tree":
                    
                    return {
                        roots: {func: "TreeLevel", FirmID: "", ObjectID: ""}
                    };
                    
                case "LSList":
                    
                    return {
                        list: {func: "LSList", FirmID: info.FirmID, ObjectID: info.ObjectID},
                        
                        state: {func: "ObjectHardWorkTariffState", FirmID: info.FirmID, ObjectID: info.ObjectID}
                    };
                    
                case "Object":
                    
                    res = {
                        props: {func: "GetObjectProps", FirmID: info.FirmID, ObjectID: info.ObjectID},

                        calcParams: {func: "GetObjectCalcParams", FirmID: info.FirmID, ObjectID: info.ObjectID},

                        tariffTOState: {func: "ObjectTariffTOState", FirmID: info.FirmID, ObjectID: info.ObjectID},

                        equipmentState: {func: "ObjectHardState", FirmID: info.FirmID, ObjectID: info.ObjectID}
                    };
                    
                    if(info.Type == "Firm")
                    {
                        res.tariffs = {func: "GetTariffs", FirmID: info.FirmID};
                        
                        res.tariffsTO = {func: "GetTariffsTO", FirmID: info.FirmID};
                        
                        res.bankAccounts = {func: "GetBankAccounts", FirmID: info.FirmID};
                    }
                                        
                    return res;
                    
                case "History":
                    
                    res = {data: {FirmID: info.FirmID, ObjectID: info.ObjectID, AttrID: info.AttrID}};
            
                    if(info.AttrType == "Props") res.data.func = 'ObjectPropDetails';

                    if(info.AttrType == "CalcParams") res.data.func = 'CalcParamDetails';

                    if(info.AttrType == "Tariffs") res.data.func = 'TariffValueDetails';

                    if(info.AttrType != "Tariffs")
                    {
                        res.types = {func: "DataTypes", FirmID: info.FirmID};
                    }

                    return res;
                    
                case "CalcParams":
                    
                    return {
                        data: {func: "GetChildrenHistoryCalcParams", FirmID: info.FirmID, ObjectID: info.ObjectID}
                    };
                
                case "Document":
                    
                    return {
                        document: {func: "GetDoc", FirmID: info.FirmID, DocumentID: info.DocumentID}
                    };
                    
                case "TariffsTOHistory":
                    
                    return {
                        data: {func: "TariffTOValueDetails", FirmID: info.FirmID, TariffID: info.TariffID},
                        type: {func: "GetHardTypes"}
                    }
                    
                case "EquipmentHistory":
                    
                    return {
                        //history: {func: "ObjectHardWorkTariffDetails", FirmID: info.FirmID, ObjectID: info.ObjectID},
                        
                        history: {func: "ObjectHardDetails", FirmID: info.FirmID, ObjectID: info.ObjectID},

                        kits: {func: "GetHardTypes"}
                    };
                    
                case "EquipmentHistory2":
                    
                    return {
                        history: {func: "ObjectHardWorkTariffDetails", FirmID: info.FirmID, ObjectID: info.ObjectID},
                        
                        kits: {func: "GetHardTypes"},
                        
                        tariffs: {func: "GetTariffsTO", FirmID: info.FirmID}
                    }
                    
                case "ObjectTariffTOHistory":
                    
                    return {
                        history: {func: "ObjectTariffTODetails", FirmID: info.FirmID, ObjectID: info.ObjectID},

                        tariffs: {func: "GetTariffsTO", FirmID: info.FirmID}
                    };
            }
        }
    },
    methods:
    {
        ...mapMutations(['DESTROY_TREE', 'CLEAR_TURNOVER']),
        remove: function()
        {
            this.$emit('delete');
        },
        reload: function()
        {
            if(this.type == "Tree") this.DESTROY_TREE();
            else this.vuexClear(this.queries);
            
            if(this.type == "Object")
            {
                this.CLEAR_TURNOVER({FirmID: this.info.FirmID, LSID: this.info.ObjectID});
            }
        },
        setHeader: function(header)
        {
            this.header = header;
        },
        combine: function(info, data)
        {
            let res = {};
            
            for(let key in info) res[key] = info[key];
            
            for(let key in data) res[key] = data[key];
            
            return res;
        }
    }
}
</script>

<style>

</style>
