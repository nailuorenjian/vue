<template>
  <div>
    <!-- 搜索栏 -->
    <el-card class="box-card" id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.username" placeholder="username" clearable></el-input>
          <el-input v-model="searchModel.phone" placeholder="phone" clearable></el-input>
          <el-button @click="getUserList" type="primary" round icon="el-icon-search">search</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-button @click="openEditUI(null)" type="primary" icon="el-icon-plus" circle></el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 查询结果 -->
    <el-card>
      <el-table :data="userList" stripe style="width: 100%">
        <el-table-column label="#" width="80">
          <template slot-scope="scope">
            {{ (searchModel.pageNo - 1) * searchModel.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="id" label="userId" width="180">
        </el-table-column>
        <el-table-column prop="username" label="username" width="180">
        </el-table-column>
        <el-table-column prop="status" label="status" width="180">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1">true</el-tag>
            <el-tag v-if="scope.row.status == 0" type="danger">banded</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="phone" width="180">
        </el-table-column>
        <el-table-column prop="email" label="email">
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template slot-scope="scope">
            <el-button @click="openEditUI(scope.row.id)" type="primary" icon="el-icon-edit" circle></el-button>
            <el-button @click="deleteUser(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组建 -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo" :page-sizes="[5, 10, 20, 50]" :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>

    <!-- user info add-->
    <el-dialog @close="clearForm" :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="userForm" ref="userFormRef" :rules="rules">
        <el-form-item label="user name" prop="username" :label-width="formLabelWidth">
          <el-input v-model="userForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="userForm.id == null || userForm.id == undefined" label="user password" prop="password"
          :label-width="formLabelWidth">
          <el-input type="password" v-model="userForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="user phone" :label-width="formLabelWidth">
          <el-input v-model="userForm.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="user status" :label-width="formLabelWidth">
          <el-switch v-model="userForm.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="user role" :label-width="formLabelWidth">
          <el-checkbox-group v-model="userForm.roleIdList" :max="3">
            <el-checkbox v-for="role in roleList" :label="role.roleId" :key="role.roleId">{{ role.roleDesc }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="user email" prop="email" :label-width="formLabelWidth">
          <el-input v-model="userForm.email" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import userApi from '@/api/userManage';
import roleApi from '@/api/roleManage';
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      var reg = /^[0-9a-zA-Z]+([\.\-_]*[0-9a-zA-Z]+)*@([0-9a-zA-Z]+[\-_]*[0-9a-zA-Z]+\.)+[0-9a-zA-Z]{1,6}$/
      if (!reg.test(value)) {
        return callback(new Error('email error'));
      }
      callback();
    };
    return {
      roleList: [],
      formLabelWidth: '130px',
      userForm: {
        roleIdList: []
      },
      dialogFormVisible: false,
      title: "",
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10
      },
      userList: [],
      rules: {
        username: [
          { required: true, message: 'input your name', trigger: 'blur' },
          { min: 1, max: 55, message: '长度在 1 到 55 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'input your password', trigger: 'blur' },
          { min: 6, max: 26, message: '长度在 6 到 26 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'input your email', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
      }
    };
  },
  methods: {
    getAllRoleList() {
      roleApi.getAllRoleList().then(response => {
        this.roleList = response.data;
      });
    },
    deleteUser(user) {
      this.$confirm(`此操作将永久删除 ${user.username}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userApi.deleteUserById(user.id).then(response => {
          this.$message({
            type: 'info',
            message: response.message
          });
          this.getUserList();
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    saveUser() {
      // 表单验证
      this.$refs.userFormRef.validate((valid) => {
        if (valid) {
          // 提交请求
          userApi.saveUser(this.userForm).then(response => {
            // 成功的提示
            this.$message({
              message: response.message,
              type: 'success'
            });
            // 关闭对话框
            this.dialogFormVisible = false;
            // 刷新数据
            this.getUserList();
          });
        } else {
          return false;
        }
      });
    },
    clearForm() {
      this.userForm = {
        roleIdList: []
      };
      this.$refs.userFormRef.clearValidate();
    },
    openEditUI(id) {
      if (id == null) {
        this.title = 'add new user';
      } else {
        this.title = 'edit user';
        // 根据id查询用户数据
        userApi.getUserById(id).then(response => {
          this.userForm = response.data;
        });
      }
      this.dialogFormVisible = true;
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getUserList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getUserList();
    },
    getUserList() {
      userApi.getUserList(this.searchModel).then(response => {
        this.userList = response.data.rows;
        this.total = response.data.total;
      });
    }
  },
  created() {
    this.getUserList();
    this.getAllRoleList();
  }
};
</script>

<style>
#search .el-input {
  width: 200px;
  margin-right: 10px;
}

.el-dialog .el-input {
  width: 85%;
}
</style>