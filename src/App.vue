<template>
    <div id="app" style="height: 100%;">
        <auth-dmf/>

        <div v-show="AuthState" class="d-flex flex-column" style="height: 100%">

            <b-navbar variant="info" class="flex-grow-0">
                <b-dropdown boundary="window">
                    <div v-for="(panel, i) in panels" @click="showPanel(i)" v-bind:class="displayClass.link[i]" class="p-3">
                        {{ panel.label }}
                    </div>
                </b-dropdown>
                <b-button @click="testing">TEST</b-button>
            </b-navbar>

            <div class="flex-fill d-flex" style="overflow: hidden">
                <div v-for="(panel, i) in panels" v-bind:class="displayClass.panel[i]" class="border" v-bind:style="{width: (100 * widths[panel.type])+'%'}">
                    <Panel :label="panel.label" :main="i==0" :type="panel.type" :info="panel.info" v-on:delete="deletePanel(i)" :addPanel="addPanel" :reload="panel.reload"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'
import ObjectDmf from './components/ObjectDMF.vue'

import Panel from './components/Panel.vue'

export default {
    name: 'app',
    components:
    {
        AuthDmf, ObjectDmf, Panel
    },
    data: function()
    {
        return {
            panels:
            [
                {type: "Tree", label: "Главная", }
            ],
            widths:
            {
                Tree: 1, LSList: 1, Object: 2
            }
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
        ...mapActions(['TEST', 'GET_FIRMS', 'GET_TREE_LEVEL']),
        showPanel: function(i)
        {
            while(this.panels.length>i+1) this.panels.pop();
        },
        addPanel: function(type, label, info, reload)
        {
            if(reload) reload();

            this.panels.push({type: type, label: label, info: info, reload: reload});
        },
        deletePanel: function(i)
        {
            while(this.panels.length>i) this.panels.pop();
        },
        testing: function()
        {
            this.$store.dispatch('TEST');
        }
    },
    created()
    {
        this.$store.dispatch('INIT')
    }
}
</script>

<!--<div column v-show="AuthState" style="height: 100%; display: flex; flex-direction: column;">
            <header style="display: flex; flex-wrap: wrap; align-items: center">





                <template v-for="(panel, i) in panels">
                    <v-icon v-if="i>0" v-bind:class="classes[i].button">
                        arrow_forward_ios
                    </v-icon>
                    <v-btn v-bind:class="classes[i].button" v-on:click="showPanel(i)">
                        {{ panel.label }}
                    </v-btn>

                </template>
                <v-btn @click="testing">тестирование</v-btn>

            </header>

            <b-navbar variant="info">
                <b-dropdown boundary="window">



                </b-dropdown>
            </b-navbar>

            <div style="display: flex; flex-grow: 1; overflow: hidden">
                <div v-for="(panel, i) in panels" v-bind:style="{'flex-grow': widths[panel.type]}" style="border: 1px solid black; height: 100%" v-bind:class="classes[i].panel">
                    <Panel :label="panel.label" :main="i==0" :type="panel.type" :info="panel.info" v-on:delete="deletePanel(i)" :addPanel="addPanel"/>
                </div>
            </div>
        </div>-->
