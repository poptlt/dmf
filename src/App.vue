<!--<template>
  <div id="app">
      <v-app>

            <auth-dmf/>

            <div v-if="ObjectsTree != undefined && ObjectsTree !='loading'">
                <v-treeview :items="ObjectsTree" :load-children="GET_TREE_LEVEL"></v-treeview>
            </div>

          <div><v-btn @click="TEST()">test</v-btn></div>

          <object-dmf type="list-dmf" :root="Objects"></object-dmf>
    </v-app>

  </div>
</template>-->

<template>
    <div id="app" style="height: 100%;">
        <auth-dmf/>
        <div column v-show="AuthState" style="height: 100%; display: flex; flex-direction: column;">
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
            <div style="display: flex; flex-grow: 1; overflow: hidden">
                <div v-for="(panel, i) in panels" v-bind:style="{'flex-grow': widths[panel.type]}" style="border: 1px solid black; height: 100%" v-bind:class="classes[i].panel">
                    <Panel :label="panel.label" :main="i==0" :type="panel.type" :info="panel.info" v-on:delete="deletePanel(i)" :addPanel="addPanel"/>
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
        return{

            panels:
            [
                {type: "Tree", label: "Главная"},
                //{width: 1, label: "Вторая",},
                //{width: 1, label: "Третья"}
            ],
            widths:
            {
                Tree: 1, LSList: 1
            }
        }
    },
    computed:
    {
        ...mapState(['Objects', 'AuthState']),
        classes: function()
        {
            let res=[], left=[1, 2, 3], classname=['sm-and-down', 'md-only', 'lg-and-up'];

            for(let i=this.panels.length-1; i>=0; i--)
            {
                res[i]={"panel": {}, "button": {}};

                for(let j=0; j<3; j++)
                {
                    res[i].panel['hidden-'+classname[j]] = (left[j]>0) ? false : true;

                    res[i].button['hidden-'+classname[j]] = (left[j]>0) ? true: false;

                    left[j]-=this.widths[this.panels[i].type];
                }
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
        }
    },
    created()
    {
        this.$store.dispatch('INIT')
    }
}
</script>

<!--<template>
    <div id="app" style="display: flex; flex-direction: column; height: 100%">
        <div style="display: flex">
            <v-btn v-for="i in panels.length" v-bind:class="classes[i-1].button" v-on:click="show(i-1)">{{ i }}</v-btn>
        </div>
        <div style="display: flex; height: 100%">
            <div v-for="(panel, i) in panels" v-bind:style="{'flex-grow': panel.type}" style="border: 1px solid black" v-bind:class="classes[i].panel">
                {{panel.type}}<Panel :first="panel.first" v-on:add="add" v-on:delete="del(i)"/>
            </div>
        </div>
    </div>
</template>

<script>




export default {
    components:
    {
        Panel
    },
    data: function()
    {
        return{

            panels:
            [
                {type: 2, first: true},
                {type: 1},
                {type: 1}
            ],
        }
    },
    computed:
    {
        classes: function()
        {
            let res=[], left=[1, 2, 3], classname=['sm-and-down', 'md-only', 'lg-and-up'];

            for(let i=this.panels.length-1; i>=0; i--)
            {
                res[i]={"panel": {}, "button": {}};

                for(let j=0; j<3; j++)
                {
                    res[i].panel['hidden-'+classname[j]] = (left[j]>0) ? false : true;

                    res[i].button['hidden-'+classname[j]] = (left[j]>0) ? true: false;

                    left[j]-=this.panels[i].type;
                }
            }

            return res;
        }
    },
    methods:
    {
        show: function(i)
        {
            while(this.panels.length>i+1) this.panels.pop();
        },
        add: function(type)
        {
            this.panels.push({type: type});
        },
        del: function(i)
        {
            while(this.panels.length>i) this.panels.pop();
        }
    }
}
</script>-->

