<template>
    <v-form v-show="!AuthState">
        <v-text-field
            v-model="email"
            :error-messages="emailErrors"
            label="E-mail"
            required
            @input="$v.email.$touch()"
            @blur="$v.email.$touch()"
            @keyup.enter="submit"
        ></v-text-field>
        <v-text-field
            v-model="password"
            :error-messages="PasswordErrors"
            label="Пароль"
            type="password"
            required
            @input="$v.password.$touch()"
            @blur="$v.password.$touch()"
            @keyup.enter="submit"
        ></v-text-field>
        <v-checkbox v-model="remember_me" label="Запомнить меня"></v-checkbox>
        <v-btn @click="submit">Вход</v-btn>
    </v-form>
</template>

<script>
    import { validationMixin } from 'vuelidate'
    import { required, minLength, email, password } from 'vuelidate/lib/validators'
    import {mapState, mapGetters, mapActions} from 'vuex'

    export default {
        name: 'AuthDMF',
        props: {},

        mixins: [validationMixin],

        validations: {
            email: { required, email },
            password: {required}
        },

        data: () => ({
            email: '',
            password: '',
            remember_me: true}),

        computed: {
            ...mapState(['AuthState']),
            ...mapActions(['AUTH']),
            emailErrors () {
                const errors = [];
                if (!this.$v.email.$dirty) return errors;
                !this.$v.email.email && errors.push('Необходимо ввести корректный e-mail!');
                !this.$v.email.required && errors.push('E-mail обязателен!');
                return errors
                },
            PasswordErrors () {
                const errors = [];
                if (!this.$v.password.$dirty) return errors;
                !this.$v.password.required && errors.push('Пароль обязателен!')
                return errors
                }
            },

        methods: {
            //...mapActions(['AUTH']),
            submit () {
                this.$v.$touch();
                if (!this.$v.$invalid) {
                    let data = {email: this.email, password: this.password, remember_me: this.remember_me};
                    this.$store.dispatch('AUTH', data);
                    //this.AUTH(data);
                    }
                }
        }
    }
</script>

