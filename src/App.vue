<template>
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
</template>

<script>
import { mapActions, mapState} from 'vuex'

import AuthDmf from './components/AuthDMF.vue'
import ObjectDmf from './components/ObjectDMF.vue'

export default {
  name: 'app',
  components: {
    AuthDmf, ObjectDmf
  },
    computed: {
    ...mapState(['Objects', 'ObjectsTree'])

    },
methods: {
    ...mapActions(['TEST', 'GET_FIRMS', 'GET_TREE_LEVEL'])},

    created() {this.$store.dispatch('GET_FIRMS')}
}
</script>

<style>
</style>
