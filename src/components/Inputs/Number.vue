<template>
    <input v-if="created" type="text" class="form-control" v-model="value" v-on:input="change">
</template>

<script>
export default {
    props: ["NoNegative", "Digits", "DigitsAfterPoint", "CanBeEmpty"],
    data: function()
    {
        return {
            value: ""
        }
    },
    computed:
    {
        created: function()
        {
            this.change();
            
            return true;
        }
    },
    methods:
    {
        change: function()
        {
            function only_digits(str)
            {
                for(let i=0; i<str.length; i++)
                {
                    if(!(str[i]>='0' && str[i]<='9')) return false;
                }
                return true;
            }
            
            let val = this.value;

            if(val == "" && this.CanBeEmpty) val = null;
            else
            {
                let fst=0;
                if(this.NoNegative == false && val.length>0 && val[0]=='-') fst++;

                let before, after, point=val.indexOf(".");
                if(point!=-1)
                {
                    before=val.substring(fst, point), after=val.substr(point+1);
                }
                else
                {
                    before=val.substr(fst), after="";
                }

                if(only_digits(before) && only_digits(after) && before.length > 0 && before.length+after.length <= this.Digits && after.length <= this.DigitsAfterPoint)
                {
                    val = parseFloat(val);
                }
                else val = undefined;
            }
                        
            this.$emit("change", val);
        }
    }
}
</script>

<style>
    
</style>
