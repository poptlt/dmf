<template>


             <ul>
                <li v-for="(obj, index) in root" :key='index'>
                    {{ obj.name }}
                </li>
            </ul>






</template>



<script>

    export default {
        name: 'ListDMF',
        props: ['root'],

    }

</script>
