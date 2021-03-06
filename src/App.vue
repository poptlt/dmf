<template>
<div id="app" style="height: 100%; font-size: 16px">
<v-app style="height: 100%">
    <auth-dmf/>

    <div v-if="AuthState" class="d-flex flex-column" style="height: 100%">

        <div class="flex-grow-0 d-flex bg-info p-2">

            <b-dropdown ref="panelsMenu" :class="displayClass.link[0]" size="sm" boundary="window" no-caret class="flex-grow-0 mr-2">
                <template slot="button-content">
                    <font-awesome-icon icon="bars"/>
                </template>
                <div style="max-width: 80vw; max-height: 70vh; overflow: auto" class="bg-white">
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
                <div style="max-width: 80vw; max-height: 70vh" class="d-flex flex-column bg-white">
                    <div class="p-2">
                        <input ref="searchInput" v-model="searchStr" @input="search" type="text" class="form-control">
                    </div>

                    <div v-if="searchMessage" class="p-2">{{ searchMessage }}</div>
                    <div v-else style="overflow: auto">
                        <div v-for="item in searchList"
                             @click="showLS(item)"
                             class="p-2 border-bottom">
                            {{ item.Name }}
                        </div>
                    </div>
                </div>

            </b-dropdown>

            <button @click="testing" class="flex-grow-0 btn btn-secondary btn-sm ml-2">TEST</button>

            <div></div>

            <button class="flex-grow-0 btn btn-secondary btn-sm" @click="goToPage('/')">
                <!--<img style="height: 20px" src="home_house_icon_124019.png">-->
                <font-awesome-icon icon="home"/>
            </button>

            <button class="btn btn-secondary btn-sm flex-grow-0 ml-2" @click="goToPage('/profile')">
                <font-awesome-icon icon="user"/>
            </button>

            <button class="btn btn-secondary btn-sm flex-grow-0 ml-2" @click="goToPage('/logout')">
                <font-awesome-icon icon="sign-out-alt"/>
            </button>

        </div>

        <div class="flex-fill row m-0" style="overflow: hidden">
            <div v-for="(panel, i) in panels" v-bind:class="displayClass.panel[i]" class="border p-0" style="height: 100%">
                <Panel ref="panels"
                       :label="panel.label"
                       :main="i==0"
                       :type="panel.type"
                       :info="panel.info"
                       v-on:delete="deletePanel(i)"
                       @setLabel="function(label){ setLabel(i, label) }"
                       :addPanel="addPanel"
                       :showObject="showObject"/>
            </div>
        </div>

    </div>

    <v-dialog data-app
              v-model="confirm.show"
              content-class="bg-white p-2 m-1"
              max-width="300px">
        <div class="text-center mb-3">{{ confirm.question }}</div>
        <div class="d-flex justify-content-around">
            <button @click="confirm.show=false; confirm.confirmed()"
                    class="flex-grow-0 btn btn-success">
                Да
            </button>
            <button @click="confirm.show=false"
                    class="flex-grow-0 btn btn-danger">
                Нет
            </button>
        </div>

    </v-dialog>

</v-app>
</div>
</template>

<script>
    
import Vue from 'vue'
    
import { mapActions, mapState} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'

import Panel from './components/Panel.vue'

export default {
    name: 'app',
    components:
    {
        AuthDmf, Panel
    },
    provide: function()
    {
        return {
            addPanel: this.addPanel,
            showObject: this.showObject,
            confirm: this.confirmation
        };
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
                Tree: 1, LSList: 1, Object: 1, History: 1, TariffsTOHistory: 1, Document: 1, CalcParams: 2, EquipmentHistory: 1, EquipmentHistory2: 1, PaymentFile: 2, EditableDocument: 1, BankPayment: 1
            },
            searchStr: "",
            searchList: [],
            searchMessage: "Ничего не найдено",
            searchTimestamp: undefined,

            url: (process.env.NODE_ENV == 'production') ? '' : 'http://dev2.dmf.su',

            confirm:
            {
                show: false,
                question: "",
                confirmed: function(){}
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

                for(let j=0; j<3; j++)
                {
                    if(left[j] > 0) left[j]-=this.widths[this.panels[i].type];
                }
            }

            for(let i=this.panels.length-1; i>=0; i--)
            {
                let width = this.widths[this.panels[i].type];

                let sm = 12/(1-left[0])*width;

                res.panel[i]["col-" + sm] = true;

                let md = 12/(2-left[1])*width;

                res.panel[i]["col-md-" + md] = true;

                let lg = 12/(3-left[2])*width;

                res.panel[i]["col-lg-" + lg] = true;

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
        showObject: function({FirmID, ObjectID, Name, Type, Roles})
        {
            console.log(Roles);
            this.addPanel("Object", Name, {FirmID: FirmID, ObjectID: ObjectID, Name: Name, Type: Type, Roles: Roles});
        },
        deletePanel: function(i)
        {
            this.panels.splice(i, 1);
        },
        setLabel(i, label)
        {
            Vue.set(this.panels[i], "label", label);
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
        showLS: function(data)
        {
            this.$refs.searchMenu.hide(true);
            
            this.searchStr = "", this.searchMessage = "Ничего не найдено";
                        
            this.showObject(data);
        },
        goToPage: function(url)
        {
            window.location.replace(this.url + url);
        },
        confirmation(question, func)
        {
            this.confirm.show = true;
            this.confirm.question = question;
            this.confirm.confirmed = func;
        }

    },
    /*created()
    {
        this.$store.dispatch('INIT')
    }*/
}
</script>
