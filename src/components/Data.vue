<template>
    <div v-if="show !== undefined">

        <center v-if="show === null" class="text-primary p-2">
            <font-awesome-icon icon="spinner" size="3x" pulse/>
        </center>

        <div v-else-if="typeof(show) == 'object' && show.DMF_ERROR" class="alert alert-danger">
            {{ show.message }}
        </div>

        <div v-else><slot/></div>

    </div>
</template>

<script>
export default {
    props: ["data"],
    computed:
    {
        show: function()
        {
            console.log(this.data);
            function check(data)
            {
                if(data === undefined || data === null || (typeof(data) == 'object' && data.DMF_ERROR)) return false;
                else return true;
            }

            if(Array.isArray(this.data))
            {
                for(let i=0; i<this.data.length; i++)
                {
                    if(!check(this.data[i])) return this.data[i];
                }
            }
            else
            {
                for(let key in this.data)
                {
                    if(!check(this.data[key])) return this.data[key];
                }
            }
            return true;
        }
    }
}
</script>
