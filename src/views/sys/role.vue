<template>
  <div>
    <!-- 搜索栏 -->
    <el-card class="box-card" id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.roleName" placeholder="roleName" clearable></el-input>
          <el-button @click="getRoleList" type="primary" round icon="el-icon-search"
            >search</el-button
          >
        </el-col>
        <el-col :span="4" align="right">
          <el-button @click="openEditUI(null)" type="primary" icon="el-icon-plus" circle></el-button>
        </el-col>  
      </el-row>
    </el-card>

    <!-- 查询结果 -->
    <el-card>
      <el-table :data="roleList" stripe style="width: 100%">
        <el-table-column label="#" width="80">
          <template slot-scope="scope">
          {{(searchModel.pageNo-1) * searchModel.pageSize +scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="roleId" label="roleId" width="200">
        </el-table-column>
        <el-table-column prop="roleName" label="roleName" width="260">
        </el-table-column>
        <el-table-column prop="roleDesc" label="roleDesc" width="180">
        </el-table-column>
        <el-table-column label="操作" width="180" align="right"> 
          <template slot-scope="scope">
            <el-button @click="openEditUI(scope.row.roleId)" type="primary" icon="el-icon-edit" circle></el-button>
            <el-button @click="deleteRole(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组建 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- role info add-->
      <el-dialog @close="clearForm" :title="title" :visible.sync="dialogFormVisible">
    <el-form :model="roleForm" ref="roleFormRef" :rules="rules">
      <el-form-item label="role name" prop="roleName" :label-width="formLabelWidth">
        <el-input v-model="roleForm.roleName" node-key="menuId" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="role desc" prop="roleDesc" :label-width="formLabelWidth">
        <el-input v-model="roleForm.roleDesc" node-key="menuId" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="role manager" prop="menuIdList" :label-width="formLabelWidth">
        <el-tree :data="menuList" :props="menuProps" node-key="menuId" ref="menuRef" style="width: 85%;" default-expand-all show-checkbox></el-tree>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveRole">确 定</el-button>
    </div>
  </el-dialog>

  </div>
</template>

<script>
import roleApi from '@/api/roleManage';
import menuApi from '@/api/menuManage';
export default {
  data() {
    return {
      menuList:{},
      menuProps: {
        children: 'children',
        label: 'title'
      },
      formLabelWidth: '130px',
      roleForm: {},
      dialogFormVisible: false,
      title: "",
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10
      },
      roleList: [],
      rules: {
        roleName: [
          { required: true, message: 'input role name', trigger: 'blur' },
          { min: 1, max: 55, message: '长度在 1 到 55 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: 'input role desc', trigger: 'blur' },
          { min: 1, max: 55, message: '长度在 1 到 55 个字符', trigger: 'blur' }
        ],
      }
    };
  },
    methods: {
      getAllMenu(){
        menuApi.getAllMenu().then(response => {
          this.menuList = response.data;
        });
      },
    deleteRole(role) {
      this.$confirm(`此操作将永久删除 ${role.roleName}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        roleApi.deleteRoleById(role.roleId).then(response =>{
          this.$message({
          type: 'info',
          message: response.message
        });
        this.getRoleList();
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    saveRole() {
      // 表单验证
      this.$refs.roleFormRef.validate((valid) => {
        if (valid) {
          // getCheckedKeys 若节点可被选择（即 show-checkbox 为 true），则返回目前被选中的节点的 key 所组成的数组
          let CheckedKeys = this.$refs.menuRef.getCheckedKeys();
          let HalfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys();
          this.roleForm.menuIdList = CheckedKeys.concat(HalfCheckedKeys);
          // 提交请求
          roleApi.saveRole(this.roleForm).then(response => {
            // 成功的提示
            this.$message({
              message: response.message,
              type: 'success'
            });
            // 关闭对话框
            this.dialogFormVisible = false;
            // 刷新数据
            this.getRoleList();
          });
        } else {
          return false;
        }
      });
    },
    clearForm() {
      this.roleForm = {};
      this.$refs.roleFormRef.clearValidate();
      //设置数组为空
      this.$refs.menuRef.setCheckedKeys([]);
    },
    openEditUI(id) {
      if (id == null) {
        this.title = 'add new role';
      } else {
        this.title = 'edit role';
        // 根据id查询用户数据
        roleApi.getRoleById(id).then(response => {
          this.roleForm = response.data;
          this.$refs.menuRef.setCheckedKeys(response.data.menuIdList);
        });
      }
      this.dialogFormVisible = true;
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getRoleList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getRoleList();
    },
    getRoleList() {
      roleApi.getRoleList(this.searchModel).then(response => {
        this.roleList = response.data.rows;
        this.total = response.data.total;
      });
    }
  },
  created() {
    this.getRoleList();
    this.getAllMenu();
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