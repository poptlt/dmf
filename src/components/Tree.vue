<template>
    <!--<div style="display: flex">
        <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <v-icon size="20" color="blue" style="border: 1px solid black; border-radius: 11px; border-color: blue">add</v-icon>
            <div></div>
        </div>
        <div>
            ИП Зиннатуллин Рустам Равилович, Самарская обл, г Тольятти
        </div>
    </div>-->

    <div style="padding: 10px">
        <TreeVertex v-for="root in roots" :root="root" :noParent="true"/>
    </div>

</template>

<script>

import TreeVertex from './TreeVertex.vue';

export default {
    //name: "Tree",
    components: {TreeVertex},
    data: function()
    {
        return{

            roots:
            [
                {
                    label: "ИП Зиннатуллин Рустам Равилович, Самарская обл, г Тольятти",
                    children:
                    [
                        {
                            label: "б-р 50 лет Октября, д 2",
                            children:
                            [
                                {label: "п. 2"},
                                {label: "п. 4"},
                            ]
                        },
                        {label: "б-р Гая"},
                        {label: "б-р Космонавтов, д 8"}
                    ]
                },
                {
                    label: 'ООО "МИКРОТЕХ", Самарская обл, г Тольятти',
                    children:
                    [
                        {label: "Автозаводское шоссе, д 41, п. 1"},
                        {label: "б-р 50 лет Октября, д 27, п. 1"},
                        {
                            label: "б-р Баумана",
                            children:
                            [
                                {label: "д 1, п. 14"},
                                {label: "д 4, п. 1"}
                            ]
                        }
                    ]
                }
            ]
        }
    }
}
</script>

<style>

</style>
