<template>
<div>
    <div v-if="state == 'changing'"
         class="d-flex justify-content-center align-items-center p-2">
        <div class="flex-grow-0 mr-2">{{ message }}</div>

        <div class="text-primary flex-grow-0">
            <font-awesome-icon icon="spinner" size="2x" pulse/>
        </div>
    </div>

    <div v-else-if="state == 'done' || state == 'error'"
         :class="{alert: true, 'alert-success': state == 'done',
                 'alert-danger': state == 'error'}"
         class="d-flex m-2">
        <div>{{ message }}</div>

        <button @click="state = 'show'" class="flex-grow-0">
            <font-awesome-icon icon="times"/>
        </button>
    </div>

    <div v-show="state == 'show'">
        <slot/>
    </div>
</div>
</template>

<script>
export default {
    data: function()
    {
        return {

            state: "show",
            message: ""
        }
    },
    methods:
    {
        change: function(state, message)
        {
            this.state = state;
            this.message = message;
        }
    }
}
</script>
