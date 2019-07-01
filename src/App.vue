<template>
  <div id="app">
      <v-app>

            <auth-dmf/>

            <div>
                <v-treeview :items="OBJECTS_TREE2" :load-children="GET_TREE_LEVEL"></v-treeview>
            </div>

          <div><v-btn @click="TEST()">test</v-btn></div>

    <div v-if="Objects != undefined">
        <div v-if="typeof Objects == 'object' && Objects.DMF_ERROR">
            <span>{{ Objects.message }}</span>
        </div>
         <div v-else-if="Objects == 'loading'">
             <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
            <ul v-else>
                <li v-for="(obj, index) in Objects">
                    {{ index }}
                </li>
            </ul>

    </div>
    </v-app>

  </div>
</template>

<script>
import { mapGetters,  mapActions, mapState} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'

export default {
  name: 'app',
  components: {
    AuthDmf
  },
    computed: {
    ...mapState(['Objects']),
    ...mapGetters(['OBJECTS_TREE2'])

    },
methods: {
    ...mapActions(['TEST', 'GET_FIRMS', 'GET_TREE_LEVEL'])}
}
</script>

<style>
</style>
