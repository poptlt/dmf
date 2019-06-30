<template>
  <div id="app">
      <v-app>

            <auth-dmf/>

            <div>
                <v-treeview :items="OBJECTS_TREE2" :load-children="GET_TREE_LEVEL"></v-treeview>
            </div>

          <div><v-btn @click="test">test</v-btn></div>

        <div v-if="typeof OBJECTS == 'object' && OBJECTS.ERROR_DMF">
            <span>{{ OBJECTS.message }}</span>
        </div>
         <div v-else-if="OBJECTS == 'loading'">
             <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
            <ul v-else>
                <li v-for="(obj, index) in OBJECTS">
                    {{ obj.Name }}
                </li>
            </ul>


    </v-app>

  </div>
</template>

<script>
import { mapGetters,  mapActions} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'

export default {
  name: 'app',
  components: {
    AuthDmf
  },
    computed: {
    ...mapGetters(['OBJECTS_TREE2', 'OBJECTS'])

    },
methods: {
    ...mapActions(['TEST', 'GET_FIRMS', 'GET_TREE_LEVEL']),
    test () {this.TEST();}}
}
</script>

<style>
</style>
