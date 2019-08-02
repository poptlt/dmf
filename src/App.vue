<template>
    <div id="app" style="height: 100%;">
        <auth-dmf/>

        <div v-if="AuthState" class="d-flex flex-column" style="height: 100%">
            
            <div class="flex-grow-0 d-flex bg-info p-2">
                <b-dropdown ref="panelsMenu" :class="displayClass.link[0]" size="sm" boundary="window" no-caret class="flex-grow-0 mr-2">
                    <template slot="button-content">
                        <font-awesome-icon icon="bars"/>
                    </template>
                    <div style="max-width: 80vw">
                        <template v-for="(panel, i) in panels">

                            <hr v-if="i" :class="displayClass.link[i]" class="m-0">
                            <div @click="showPanel(i)" v-bind:class="displayClass.link[i]" class="p-3">
                                {{ panel.label }}
                            </div>

                        </template>
                    </div>
                </b-dropdown>
                
                <b-dropdown ref="searchMenu" size="sm" boundary="window" no-caret class="flex-grow-0" @shown="focus">
                    <template slot="button-content">
                        <font-awesome-icon icon="search"/>
                    </template>
                    <div style="max-width: 80vw; max-height: 70vh" class="d-flex flex-column">
                        <div class="p-2">
                            <input ref="searchInput" v-model="searchStr" @input="search" type="text" class="form-control">
                        </div>

                        <div v-if="searchMessage" class="p-2">{{ searchMessage }}</div>
                        <div v-else style="overflow: auto">
                            <div v-for="item in searchList" @click="showLS(item.LSName, item.FirmID, item.LSID)" class="p-2 border-bottom">{{ item.LSName }}</div>
                        </div>
                    </div>
                    
                </b-dropdown>
                
            </div>

            <div class="flex-fill d-flex" style="overflow: hidden">
                <div v-for="(panel, i) in panels" v-bind:class="displayClass.panel[i]" class="border" v-bind:style="{width: (100 * widths[panel.type])+'%'}">
                    <Panel :label="panel.label" :main="i==0" :type="panel.type" :info="panel.info" v-on:delete="deletePanel(i)" :addPanel="addPanel"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'

import Panel from './components/Panel.vue'

export default {
    name: 'app',
    components:
    {
        AuthDmf, Panel
    },
    data: function()
    {
        return {
            panels:
            [
                {type: "Tree", label: "Главная"}
            ],
            widths:
            {
                Tree: 1, LSList: 1, Object: 1, History: 1, Document: 1
            },
            searchStr: "",
            searchList: [],
            searchMessage: "Ничего не найдено",
            searchTimestamp: undefined
            
        }
    },
    computed:
    {
        ...mapState(['Objects', 'AuthState']),
        displayClass: function()
        {
            let res = {panel: [], link: []}, left = [1, 2, 3];

            for(let i=this.panels.length-1; i>=0; i--)
            {
                if(left[0]>0)
                {
                    res.panel[i] = {"d-block": true};
                    res.link[i] = {"d-none": true};
                }
                else if(left[1]>0)
                {
                    res.panel[i] = {"d-none": true, "d-md-block": true};
                    res.link[i] = {"d-block": true, "d-md-none": true};
                }
                else if(left[2]>0)
                {
                    res.panel[i] = {"d-none": true, "d-lg-block": true};
                    res.link[i] = {"d-block": true, "d-lg-none": true};
                }
                else
                {
                    res.panel[i] = {"d-none": true};
                    res.link[i] = {"d-block": true};
                }

                for(let j=0; j<3; j++) left[j]-=this.widths[this.panels[i].type];
            }
            return res;
        }
    },
    methods:
    {
        ...mapActions(['TEST', 'GET_FIRMS', 'GET_TREE_LEVEL', 'FIND_LS']),
        showPanel: function(i)
        {
            this.$refs.panelsMenu.hide(true);
            
            while(this.panels.length>i+1) this.panels.pop();
        },
        addPanel: function(type, label, info)
        {            
            this.panels.push({type: type, label: label, info: info});
        },
        deletePanel: function(i)
        {
            while(this.panels.length>i) this.panels.pop();
        },
        testing: function()
        {
            this.$store.dispatch('TEST');
        },
        focus: function()
        {
            this.$refs.searchInput.focus();
        },
        search: function()
        {
            this.searchTimestamp = new Date();
            
            let th = this;
            
            function func(data, timestamp)
            {
                if(timestamp == th.searchTimestamp)
                {
                    if(Array.isArray(data))
                    {
                        th.searchMessage = "", th.searchList = data;
                    }
                    else th.searchMessage = data;
                }
            }
            
            this.FIND_LS({str: this.searchStr, func: func, timestamp: this.searchTimestamp});
        },
        showLS: function(Name, FirmID, LSID)
        {
            this.$refs.searchMenu.hide(true);
            
            this.searchStr = "", this.searchMessage = "Ничего не найдено";
            
            this.addPanel("Object", Name, {FirmID: FirmID, ObjectID: LSID, ObjectType: "LS"});
        }
    },
    /*created()
    {
        this.$store.dispatch('INIT')
    }*/
}
</script>