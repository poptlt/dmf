<template>

    <div v-if="root != undefined">
        <div v-if="typeof root == 'object' && root.DMF_ERROR">
            <span>{{ root.message }}</span>
        </div>
         <div v-else-if="root == 'loading'">
             <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
            <div v-else>

             <component :is="type" :root="root"></component>

       </div>

    </div>





</template>



<script>

 import ListDmf from './ListDMF.vue'

    export default {
        name: 'ObjectDMF',
        props: ['type', 'root'],
  components: {
    ListDmf
  },
    }

</script>
