<template>
    <div style="display: flex">
        <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <v-icon size="20" color="blue" style="border: 1px solid black; border-radius: 11px; border-color: blue">add</v-icon>
            <div></div>
        </div>
        <div>
            ИП Зиннатуллин Рустам Равилович, Самарская обл, г Тольятти
        </div>
    </div>
</template>

<script>

//import Tree from './Tree.vue';

export default {
    name: "Tree",
    props: ['depth'],
    data: function()
    {
        return{

        }
    }
}
</script>

<style>

</style>
