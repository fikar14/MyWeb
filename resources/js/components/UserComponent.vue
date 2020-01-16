<template>
  <v-app>
    <v-data-table 
      :headers="headers"
      :items="users.data"
      :items-per-page=5
      @pagination="paginate"
      item-key="name" 
      sort-by="calories"
      class="elevation-1" 
      color="primary"
      :loading = "loading"
      loading-text="Loading... Please wait"
      :server-items-length="users.total"
      show-select
      @input="selectAll"
      :footer-props= "{
        itemsPerPageOptions: [5,10,15],
        itemsPerPageText: 'Users Per Page',
        'show-current-page': true,
        'show-first-last-page': true
        }"
    >
    <template v-slot:top>
      <v-toolbar flat color="dark">
        <v-toolbar-title>Users Management System</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>        
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="blue darken-3" dark class="mb-2" v-on="on">Add New User</v-btn>
            <v-btn color="error" dark class="mb-2 mr-2" @click="deleteAll">Delete</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-form
              v-model="valid"
              method="post"
              v-on:submit.stop.prevent= "save"
            >
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12">
                      <v-text-field 
                        v-model="editedItem.name" 
                        label="Name" 
                        :rules="[rules.required, rules.min]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="editedIndex == -1">
                    <v-col cols="12" sm="12">
                      <v-text-field 
                        v-model="editedItem.password" 
                        type="password"
                        label="Type Password" 
                        :rules="[rules.required, rules.passMin]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-text-field 
                        v-model="editedItem.rpassword" 
                        type="password"
                        label="Retype Password" 
                        :rules="[rules.required, passwordMatch]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-text-field
                        v-model="editedItem.email"
                        type="email"
                        label="E-mail"
                        :rules="[rules.required, rules.validEmail]"
                      ></v-text-field>
                    </v-col>                    
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="12">
                      <v-select
                        :items="roles"
                        v-model="editedItem.role" 
                        label="Select Role" 
                        :rules="[rules.required]"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn type="submit" :disabled="!valid" @click.prevent="save" color="blue darken-1" text>Save</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-row>
        <v-col cols="12" sm="12">
          <v-text-field
          class="mx-4"
            @input="searchIt"
            label="Search"
          ></v-text-field>
        </v-col>
      </v-row>
    </template>
    <template v-slot:item.photo="{item}">
      <v-img
        :src="item.photo"
        :lazy-src="item.photo"
        aspect-ratio="1"
        class="grey lighten-2"
        max-width="50"
        max-height="50"
      ></v-img>
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        edit
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
    </v-data-table>
    <v-snackbar
      v-model="snackbar"
      >
      {{ text }}
      <v-btn
          color="blue darken-3"
          text
          @click="snackbar = false"
      >
          Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>
</template>
<script>
  export default {
    data: () => ({
      valid: true,
      dialog: false,
      loading: false,
      snackbar: false,
      selected: [],
      roles: [],
      rules:{
        required: v => !!v || 'This Field is Required',
        min: v => (v && v.length >= 5) || 'Name must be less than 5 characters',
        passMin: v => (v && v.length >= 8) || 'Name must be less than 8 characters',
        validEmail: v => /.+@.+\..+/.test(v) || 'Email must be valid',
      },
      text: '',
      headers: [
        { text: '#', align: 'left', sortable: false, value: 'id'},
        { text: 'Name', sortable: false, value: 'name' },
        { text: 'Email', sortable: false, value: 'email' },
        { text: 'Role', sortable: false, value: 'role' },
        { text: 'Photo', sortable: false, value: 'photo' },
        { text: 'Created At', sortable: false, value: 'created_at' },
        { text: 'Updated At', sortable: false, value: 'updated_at' },
        { text: 'Actions', value: 'action', sortable: false },
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        id: '',
        name: '',
        email: '',
        role:'',
        password: ''

      },
      defaultItem: {
        id: '',
        name: '',
        password: '',
        rpassword: '',
        email: '',
        role: '',        
        photo: '',
        created_at: '',
        updated_at: '',

      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New User' : 'Edit User'
      },
      passwordMatch(){
        return this.editedItem.password != this.editedItem.rpassword ? 'Password Does Not Match' : true
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
    },

    created () {
      this.initialize()
    },

    methods: {
      selectAll(e){
        this.selected = [];
        if(e.length > 0){
          this.selected = e.map(val => val.id)
        }
      },
      deleteAll(item){
        const index = this.users.data.indexOf(item)
        let decide = confirm('Are you sure you want to delete this item?')
        axios.post('/api/users/delete', {'users': this.selected})
          .then(res => {
            this.text = "Records Deleted Successfully!";
            this.snackbar = true
            this.selected.map(val => {
              const index = this.users.data.indexOf(val)
              this.users.data.splice(index, 1)
            })
          })
          .catch(err => {
            console.log(err.response)
            this.text = "Error Deleting Records"
            this.snackbar = true
          })
      },
      searchIt(e){
        if(e.length > 1){
          axios.get(`/api/users/${e}`)
            .then(res => this.users = res.data.users)
            .catch(err => console.dir(err.response))
        }else{
          if(e.length<=1){
            axios.get('/api/users')
              .then(res => this.users = res.data.users)
              .catch(err => console.dir(err.response))
          }
        }
      },
      paginate(e){
        axios.get(`api/users?page=${e.page}`, {params:{'per_page': e.itemsPerPage}})
          .then(res => {
              this.users = res.data.users
              this.roles = res.data.roles
            //   console.dir(res.data.users)
          })
          .catch(err => {
            if(err.response.status == 401)
              localStorage.removeItem('token');
              this.$router.push('/login');
          })
      },
      initialize () {
        // Add a request interceptor
          axios.interceptors.request.use((config)=> {
            this.loading = true;            
            return config;
          }, (error)=> {
            this.loading = false;
            return Promise.reject(error);
          });

          // Add a response interceptor
          axios.interceptors.response.use((response)=> {
            this.loading = false;
            return response;
          }, (error)=> {
            this.loading = false;
            return Promise.reject(error);
          });
      },
      editItem (item) {
        this.editedIndex = this.users.data.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        //Delete User
        const index = this.users.data.indexOf(item)
        let decide = confirm('Are you sure you want to delete this item?')
        axios.delete('/api/users/'+item.id)
        .then(res => {
          this.text = "Record Deleted Successfully!";
          this.snackbar = true
          this.users.data.splice(index, 1)
        })
        .catch(err => {
          console.log(err.response)
          this.text = "Error Deleting Record"
          this.snackbar = true
        })
      },

      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.editedItem)
          this.editedIndex = -1
        }, 300)
      },

      save () {
        if (this.editedIndex > -1) {
          //Edit User
          const index = this.editedIndex
          axios.put('/api/users/'+this.editedItem.id, {'name': this.editedItem.name})
          .then(res => {
            this.text = "Record Update Successfully!";
            this.snackbar = true
            Object.assign(this.users.data[index], res.data.user)
          })
          .catch(err => {
            console.log(err.response)
            this.text = "Error Updating Record"
            this.snackbar = true
            })
          // Object.assign(this.users[this.editedIndex], this.editedItem)
        } else {
          //Create User
          axios.post('/api/users', this.editedItem)
          .then(res =>  {
            this.text = "Record Added Successfully"
            this.snackbar = true
            this.users.data.push(res.data.user)
            })
          .catch(err => {
            console.dir(err.response)
            this.text = "Error Adding Record"
            this.snackbar = true
            })          
        }
        this.close()
      },
    },
  }
</script>
<style scoped>

</style>